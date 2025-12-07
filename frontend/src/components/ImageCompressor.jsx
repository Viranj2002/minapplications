import React, { useState } from 'react';

const ImageCompressor = ({ setActiveTab }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [compressedImage, setCompressedImage] = useState(null);
    const [originalSize, setOriginalSize] = useState(0);
    const [compressedSize, setCompressedSize] = useState(0);
    const [isCompressing, setIsCompressing] = useState(false);
    const [quality, setQuality] = useState(0.7);
    const [maxDimension, setMaxDimension] = useState(1920);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setOriginalSize(file.size);
            setCompressedImage(null);
            setCompressedSize(0);
        }
    };

    const compressImage = () => {
        if (!selectedFile) return;

        setIsCompressing(true);
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width;
                let height = img.height;

                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Determine output format based on original file type
                const outputFormat = selectedFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
                const fileExtension = selectedFile.type === 'image/png' ? 'png' : 'jpg';

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            setCompressedImage({ url, extension: fileExtension });
                            setCompressedSize(blob.size);
                            setIsCompressing(false);
                        }
                    },
                    outputFormat,
                    quality
                );
            };
        };
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="image-compressor-container" style={{ padding: '20px', color: '#222' }}>
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
            <h2 style={{ marginBottom: '20px' }}>Image Compressor</h2>

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
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ marginBottom: '20px', width: '100%' }}
                />

                {selectedFile && (
                    <div style={{ marginBottom: '20px' }}>
                        <p>Original Size: <strong>{formatSize(originalSize)}</strong></p>
                        <div style={{ margin: '15px 0' }}>
                            <label>Max Dimension: {maxDimension}px</label>
                            <input
                                type="range"
                                min="480"
                                max="3840"
                                step="240"
                                value={maxDimension}
                                onChange={(e) => setMaxDimension(parseInt(e.target.value))}
                                style={{ width: '100%', marginTop: '5px' }}
                            />
                            <small style={{ color: '#666' }}>Larger images will be resized to this max width/height</small>
                        </div>
                        <div style={{ margin: '15px 0' }}>
                            <label>Quality: {Math.round(quality * 100)}%</label>
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={quality}
                                onChange={(e) => setQuality(parseFloat(e.target.value))}
                                style={{ width: '100%', marginTop: '5px' }}
                            />
                        </div>
                        <button
                            onClick={compressImage}
                            disabled={isCompressing}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#4a90e2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '15px'
                            }}
                        >
                            {isCompressing ? 'Compressing...' : 'Compress Image'}
                        </button>
                    </div>
                )}

                {compressedImage && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
                        <h3>Result</h3>
                        <p>Compressed Size: <strong>{formatSize(compressedSize)}</strong></p>
                        <p style={{ color: 'green' }}>
                            Saved: {((originalSize - compressedSize) / originalSize * 100).toFixed(2)}%
                        </p>
                        <img src={compressedImage.url} alt="Compressed" style={{ maxWidth: '100%', maxHeight: '300px', margin: '10px 0', borderRadius: '8px' }} />
                        <br />
                        <a
                            href={compressedImage.url}
                            download={`compressed_${selectedFile.name.split('.')[0]}.${compressedImage.extension}`}
                            style={{
                                display: 'inline-block',
                                marginTop: '10px',
                                padding: '10px 20px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '6px'
                            }}
                        >
                            Download Compressed Image
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageCompressor;
