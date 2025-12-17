import React, { useState } from 'react';
import { saveAs } from 'file-saver';

const WordToPdf = ({ setActiveTab }) => {
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

    const convertToPdf = async () => {
        if (!selectedFile) return;

        setIsConverting(true);
        setStatusMessage('Uploading and converting...');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://127.0.0.1:8000/convert/word-to-pdf', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Conversion failed');
            }

            const blob = await response.blob();
            saveAs(blob, selectedFile.name.replace('.docx', '.pdf'));

            setStatusMessage(`Converted ${selectedFile.name} successfully!`);
        } catch (error) {
            console.error("Error converting Word to PDF:", error);
            setStatusMessage('Error: ' + error.message);
        } finally {
            setIsConverting(false);
        }
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
                        fontSize: '15px',
                        width: '100%'
                    }}
                >
                    {isConverting ? 'Converting...' : 'Convert to PDF'}
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

export default WordToPdf;

