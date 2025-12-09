import React from 'react';

const SettingsHelp = ({ onBack }) => {
    return (
        <div className="settings-help-container">
            <div className="settings-help-header">
                <button className="back-btn" onClick={onBack}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    <span>Back</span>
                </button>
            </div>

            <div className="help-content-scroll">
                <div className="help-hero">
                    <h1>Welcome to our user's guide</h1>
                    <p>Although we have tried to make it really simple, here is a short guidance to help you through the editing process.</p>
                </div>

                <div className="help-section">
                    <div className="help-category-title">CONVERT & COMPRESS</div>

                    {/* Image to PDF */}
                    <div className="help-item">
                        <div className="help-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </div>
                        <div className="help-item-content">
                            <h3>Image to PDF</h3>
                            <p>To convert <strong>images to PDF</strong>, upload your images from your <strong>device</strong>. You can arrange the images in the order you want them to appear in the PDF.</p>
                            <p>Once uploaded, click the button to process your files and download your single PDF document containing all your images.</p>
                        </div>
                    </div>

                    {/* Image Compressor */}
                    <div className="help-item">
                        <div className="help-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                <polyline points="4 14 10 14 10 20"></polyline>
                                <polyline points="20 10 14 10 14 4"></polyline>
                                <line x1="14" y1="10" x2="21" y2="3"></line>
                                <line x1="3" y1="21" x2="10" y2="14"></line>
                            </svg>
                        </div>
                        <div className="help-item-content">
                            <h3>Image Compressor</h3>
                            <p>To <strong>compress images</strong>, select the images you want to optimize from your <strong>device</strong>.</p>
                            <p>Our tool will automatically reduce the file size while maintaining the best possible quality. Perfect for web use and saving storage space.</p>
                        </div>
                    </div>

                    {/* Word to PDF */}
                    <div className="help-item">
                        <div className="help-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <div className="help-item-content">
                            <h3>Word to PDF</h3>
                            <p>Convert your <strong>DOC and DOCX files to PDF</strong> easily. Select the Word document from your <strong>device</strong>.</p>
                            <p>The tool preserves the original formatting, fonts, and images. Just upload and download your professional PDF document.</p>
                        </div>
                    </div>

                    {/* PDF to Word */}
                    <div className="help-item">
                        <div className="help-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <path d="M12 18v-6l4 3-4 3z"></path>
                            </svg>
                        </div>
                        <div className="help-item-content">
                            <h3>PDF to Word</h3>
                            <p>Convert <strong>PDF files to editable Word documents</strong>. Upload your PDF file to start the conversion process.</p>
                            <p>We'll extract the text and formatting so you can edit the document in Microsoft Word or any compatible editor.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsHelp;
