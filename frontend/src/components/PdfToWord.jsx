import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from 'file-saver';

// Set worker source
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const PdfToWord = ({ setActiveTab }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isConverting, setIsConverting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setStatusMessage('');
        }
    };

    const convertToWord = async () => {
        if (!selectedFile) return;

        setIsConverting(true);
        setStatusMessage('Uploading and converting...');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // Use the clean endpoint to ensure temp files are removed
            const response = await fetch('http://127.0.0.1:8000/convert/pdf-to-word-clean', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Conversion failed');
            }

            const blob = await response.blob();
            saveAs(blob, selectedFile.name.replace('.pdf', '.docx'));

            setStatusMessage(`Converted ${selectedFile.name} successfully!`);
        } catch (error) {
            console.error("Error converting PDF to Word:", error);
            setStatusMessage('Error: ' + error.message);
        } finally {
            setIsConverting(false);
        }
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
                        fontSize: '15px',
                        width: '100%'
                    }}
                >
                    {isConverting ? 'Converting...' : 'Convert to Word'}
                </button>

                {statusMessage && (
                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        background: statusMessage.startsWith('Error') ? '#fee2e2' : '#dcfce7',
                        color: statusMessage.startsWith('Error') ? '#991b1b' : '#166534',
                        borderRadius: '8px',
                        fontSize: '14px'
                    }}>
                        {statusMessage}
                    </div>
                )}
            </div>
        </div>
    );
};
export default PdfToWord;
