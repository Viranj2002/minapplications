import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToWord = ({ setActiveTab }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isConverting, setIsConverting] = useState(false);
    const [extractedText, setExtractedText] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setExtractedText('');
        }
    };

    const convertToWord = async () => {
        if (!selectedFile) return;

        setIsConverting(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const typedarray = new Uint8Array(event.target.result);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = "";
                let htmlContent = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();

                    // Build structured text with better formatting
                    let pageText = "";
                    let lastY = null;

                    textContent.items.forEach((item, index) => {
                        const currentY = item.transform[5];

                        // Detect new lines based on Y position
                        if (lastY !== null && Math.abs(currentY - lastY) > 5) {
                            pageText += "\n";
                        }

                        pageText += item.str;

                        // Add space if next item is on same line
                        if (index < textContent.items.length - 1) {
                            const nextItem = textContent.items[index + 1];
                            if (Math.abs(nextItem.transform[5] - currentY) < 5) {
                                pageText += " ";
                            }
                        }

                        lastY = currentY;
                    });

                    fullText += pageText + "\n\n";
                    htmlContent += `<p>${pageText.replace(/\n/g, '<br>')}</p>`;
                }

                setExtractedText(fullText);

                // Create a proper Word-compatible HTML document
                const wordHtml = `
                    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                          xmlns:w='urn:schemas-microsoft-com:office:word' 
                          xmlns='http://www.w3.org/TR/REC-html40'>
                    <head>
                        <meta charset='utf-8'>
                        <title>Converted Document</title>
                        <style>
                            body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5; }
                            p { margin: 0 0 10pt 0; }
                        </style>
                    </head>
                    <body>
                        ${htmlContent}
                    </body>
                    </html>
                `;

                const blob = new Blob(['\ufeff', wordHtml], {
                    type: 'application/msword'
                });

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = selectedFile.name.replace('.pdf', '.doc');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                setIsConverting(false);
            } catch (error) {
                console.error("Error converting PDF to Word:", error);
                alert("Error converting file: " + error.message);
                setIsConverting(false);
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    return (
        <div className="pdf-to-word-container" style={{ padding: '20px', color: '#222' }}>
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
            <h2 style={{ marginBottom: '20px' }}>PDF to Word Converter</h2>

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
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ marginBottom: '20px', width: '100%' }}
                />

                <button
                    onClick={convertToWord}
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
                    {isConverting ? 'Converting...' : 'Convert to Word'}
                </button>

                {extractedText && (
                    <div style={{ marginTop: '20px', padding: '15px', background: 'white', borderRadius: '8px', maxHeight: '300px', overflow: 'auto' }}>
                        <h4>Preview:</h4>
                        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
                            {extractedText}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfToWord;
