import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

const PdfConverter = ({ setActiveTab }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isConverting, setIsConverting] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const convertToPdf = async () => {
        if (!selectedFile) return;

        setIsConverting(true);
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgData = e.target.result;
                const image = new Image();
                image.src = imgData;

                image.onload = () => {
                    const doc = new jsPDF();
                    const width = doc.internal.pageSize.getWidth();
                    const height = doc.internal.pageSize.getHeight();

                    // Calculate aspect ratio to fit image in PDF
                    const imgRatio = image.width / image.height;
                    const pageRatio = width / height;

                    let renderWidth, renderHeight;

                    if (imgRatio > pageRatio) {
                        renderWidth = width;
                        renderHeight = width / imgRatio;
                    } else {
                        renderHeight = height;
                        renderWidth = height * imgRatio;
                    }

                    const format = selectedFile.type === 'image/png' ? 'PNG' : 'JPEG';
                    doc.addImage(imgData, format, (width - renderWidth) / 2, (height - renderHeight) / 2, renderWidth, renderHeight);
                    doc.save('converted.pdf');
                    setIsConverting(false);
                };
            };
            reader.readAsDataURL(selectedFile);
        } catch (error) {
            console.error("Error converting to PDF:", error);
            setIsConverting(false);
        }
    };

    return (
        <div className="pdf-converter-container" style={{ padding: '20px', color: '#222' }}>
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

            <h2 style={{ color: '#222', marginBottom: '20px' }}>Image to PDF</h2>

            <div
                className="converter-card"
                style={{
                    background: '#f1f1f1',
                    padding: '30px',
                    borderRadius: '12px',
                    maxWidth: '600px',
                    margin: '0 auto',
                    textAlign: 'center',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                    border: '1px solid #ddd'
                }}
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                        marginBottom: '20px',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        background: '#fff'
                    }}
                />

                {previewUrl && (
                    <div style={{ marginBottom: '20px' }}>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '300px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        />
                    </div>
                )}

                <button
                    onClick={convertToPdf}
                    disabled={!selectedFile || isConverting}
                    style={{
                        padding: '10px 24px',
                        backgroundColor: selectedFile ? '#4a90e2' : '#9bbce0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: selectedFile ? 'pointer' : 'not-allowed',
                        opacity: selectedFile ? 1 : 0.6,
                        fontSize: '15px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                >
                    {isConverting ? 'Converting...' : 'Convert to PDF'}
                </button>
            </div>
        </div>

    );
};

export default PdfConverter;
