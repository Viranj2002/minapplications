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
        setStatusMessage('Reading PDF...');
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const typedarray = new Uint8Array(event.target.result);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;

                const docChildren = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    setStatusMessage(`Processing page ${i} of ${pdf.numPages}...`);
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.0 });
                    const textContent = await page.getTextContent();

                    // Group text items by line (Y position)
                    const lines = {};
                    const yTolerance = 5; // Tolerance for considering items on the same line

                    textContent.items.forEach(item => {
                        const y = item.transform[5];
                        const x = item.transform[4];
                        const fontSize = Math.sqrt((item.transform[0] * item.transform[0]) + (item.transform[1] * item.transform[1])); // Approximate font size

                        // Find existing line within tolerance
                        let added = false;
                        for (const lineY in lines) {
                            if (Math.abs(y - parseFloat(lineY)) < yTolerance) {
                                lines[lineY].push({ ...item, x, fontSize });
                                added = true;
                                break;
                            }
                        }

                        if (!added) {
                            lines[y] = [{ ...item, x, fontSize }];
                        }
                    });

                    // Sort lines by Y (descending = top to bottom)
                    const sortedY = Object.keys(lines).sort((a, b) => parseFloat(b) - parseFloat(a));

                    sortedY.forEach(y => {
                        const items = lines[y];
                        // Sort items in line by X (ascending = left to right)
                        items.sort((a, b) => a.x - b.x);

                        // Construct text content for the line
                        const lineText = items.map(item => item.str).join('');
                        if (!lineText.trim()) return;

                        // Basic heuristic for centering
                        // Calculate total width of text items (approximate)
                        // Note: This is a rough estimation. PDF doesn't give precise width without rendering.
                        // We check if the line starts roughly in the middle-ish or if items are distributed.

                        // Better Heuristic: Check start X and end X relative to viewport width.
                        const startX = items[0].x;
                        const lastItem = items[items.length - 1];
                        const endX = lastItem.x + (lastItem.width || 0); // width might not be available directly in simplified item

                        // Determine Alignment
                        let alignment = AlignmentType.LEFT;
                        const pageWidth = viewport.width;
                        const lineCenter = (startX + endX) / 2;
                        const pageCenter = pageWidth / 2;

                        // If the center of the text line is close to the center of the page (within 10% margin), consider it centered
                        if (Math.abs(lineCenter - pageCenter) < (pageWidth * 0.1)) {
                            alignment = AlignmentType.CENTER;
                        }

                        // Determine Font Size (average of items)
                        const avgFontSize = items.reduce((sum, item) => sum + item.fontSize, 0) / items.length;
                        // Map PDF font size (approx points) to Docx sizes (half-points, e.g., 24 = 12pt)
                        // Simple scaler: PDF pt * 2 roughly? Or just pass through if PDF is 1:1. 
                        // Usually PDF coords are 72 DPI. Word uses 1/72 inch points too?
                        // Docx TextRun size is in half-points. So 12pt = 24.
                        const docxSize = Math.max(16, Math.round(avgFontSize * 1.5)); // Heuristic adjustment

                        const paragraph = new Paragraph({
                            alignment: alignment,
                            children: [
                                new TextRun({
                                    text: lineText,
                                    size: docxSize,
                                    font: "Calibri" // Fallback font
                                })
                            ],
                            spacing: {
                                after: 120, // Space after paragraph (twips)
                            }
                        });

                        docChildren.push(paragraph);
                    });

                    // Add page break if not last page
                    if (i < pdf.numPages) {
                        docChildren.push(new Paragraph({
                            children: [new TextRun({ text: "", break: 1 })] // Page break logic could be improved with Sections, but simple break is okay
                        }));
                    }
                }

                setStatusMessage('Generating Word document...');

                const doc = new Document({
                    sections: [{
                        properties: {},
                        children: docChildren,
                    }],
                });

                const blob = await Packer.toBlob(doc);
                saveAs(blob, selectedFile.name.replace('.pdf', '.docx'));

                setStatusMessage(`Converted ${selectedFile.name} successfully!`);
                setIsConverting(false);

            } catch (error) {
                console.error("Error converting PDF to Word:", error);
                setStatusMessage('Error: ' + error.message);
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
