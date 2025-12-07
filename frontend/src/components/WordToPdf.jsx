import React, { useState } from 'react';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';

const WordToPdf = ({ setActiveTab }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isConverting, setIsConverting] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewHtml('');
        }
    };

    const convertToPdf = async () => {
        if (!selectedFile) return;

        setIsConverting(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target.result;

                // Convert DOCX to HTML with images
                const result = await mammoth.convertToHtml(
                    { arrayBuffer: arrayBuffer },
                    {
                        convertImage: mammoth.images.imgElement(function (image) {
                            return image.read("base64").then(function (imageBuffer) {
                                return {
                                    src: "data:" + image.contentType + ";base64," + imageBuffer
                                };
                            });
                        })
                    }
                );

                const html = result.value;
                setPreviewHtml(html);

                // Create PDF
                const doc = new jsPDF();
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const margin = 15;

                // Create temporary div to parse HTML
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = html;
                tempDiv.style.width = (pageWidth - 2 * margin) + 'mm';
                tempDiv.style.fontFamily = 'Arial, sans-serif';
                tempDiv.style.fontSize = '12px';
                tempDiv.style.lineHeight = '1.5';
                document.body.appendChild(tempDiv);

                // Simple text extraction and wrapping
                let yPosition = margin;
                const lineHeight = 7;
                const maxWidth = pageWidth - 2 * margin;

                // Process each element
                const elements = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, img');

                for (let elem of elements) {
                    if (elem.tagName === 'IMG') {
                        // Handle images
                        try {
                            const imgData = elem.src;
                            const img = new Image();
                            img.src = imgData;
                            await new Promise(resolve => {
                                img.onload = resolve;
                                img.onerror = resolve;
                            });

                            const imgWidth = Math.min(maxWidth, 100);
                            const imgHeight = (img.height / img.width) * imgWidth;

                            if (yPosition + imgHeight > pageHeight - margin) {
                                doc.addPage();
                                yPosition = margin;
                            }

                            doc.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
                            yPosition += imgHeight + 5;
                        } catch (e) {
                            console.error('Error adding image:', e);
                        }
                    } else {
                        // Handle text
                        const text = elem.innerText || elem.textContent;
                        if (!text.trim()) continue;

                        let fontSize = 12;
                        let fontStyle = 'normal';

                        if (elem.tagName.match(/H[1-6]/)) {
                            fontSize = 18 - parseInt(elem.tagName[1]) * 2;
                            fontStyle = 'bold';
                        }

                        doc.setFontSize(fontSize);
                        doc.setFont('helvetica', fontStyle);

                        const lines = doc.splitTextToSize(text, maxWidth);

                        for (let line of lines) {
                            if (yPosition > pageHeight - margin) {
                                doc.addPage();
                                yPosition = margin;
                            }
                            doc.text(line, margin, yPosition);
                            yPosition += lineHeight;
                        }

                        yPosition += 3; // Add spacing after paragraph
                    }
                }

                document.body.removeChild(tempDiv);
                doc.save('converted.pdf');
                setIsConverting(false);
            } catch (error) {
                console.error("Error converting Word to PDF:", error);
                alert("Error converting file: " + error.message);
                setIsConverting(false);
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    return (
        <div className="word-to-pdf-container" style={{ padding: '20px', color: '#222' }}>
            <button
                onClick={() => setActiveTab('dashboard')}
                style={{
                    marginBottom: '20px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    border: '1px solid #999',
                    background: '#72aef3ff',
                    fontSize: '14px'
                }}
            >
                ← Back to Dashboard
            </button>
            <h2 style={{ marginBottom: '20px' }}>Word to PDF Converter</h2>

            <div style={{
                background: '#f1f1f1',
                padding: '30px',
                borderRadius: '12px',
                maxWidth: '600px',
                margin: '0 auto',
                boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                border: '1px solid #ddd'
            }}>
                <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileChange}
                    style={{ marginBottom: '20px', width: '100%' }}
                />

                <button
                    onClick={convertToPdf}
                    disabled={!selectedFile || isConverting}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: selectedFile ? '#4a90e2' : '#9bbce0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: selectedFile ? 'pointer' : 'not-allowed',
                        fontSize: '15px'
                    }}
                >
                    {isConverting ? 'Converting...' : 'Convert to PDF'}
                </button>

                {previewHtml && (
                    <div style={{ marginTop: '20px', padding: '15px', background: 'white', borderRadius: '8px', maxHeight: '300px', overflow: 'auto' }}>
                        <h4>Preview:</h4>
                        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WordToPdf;
