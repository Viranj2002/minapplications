import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SuggestionBoard from './components/SuggestionBoard';
import PdfConverter from './components/PdfConverter';
import ImageCompressor from './components/ImageCompressor';
import WordToPdf from './components/WordToPdf';
import PdfToWord from './components/PdfToWord';
import SettingsPanel from './components/SettingsPanel';
import SettingsHelp from './components/SettingsHelp';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('appTheme');
    return savedTheme || 'light';
  });

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('appTheme', theme);
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
  }, [theme]);

  return (
    <div className={`app-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      <main className="main-content">
        {activeTab === 'dashboard' ? <Dashboard setActiveTab={setActiveTab} /> :
          activeTab === 'pdf-converter' ? <PdfConverter setActiveTab={setActiveTab} /> :
            activeTab === 'image-compressor' ? <ImageCompressor setActiveTab={setActiveTab} /> :
              activeTab === 'word-to-pdf' ? <WordToPdf setActiveTab={setActiveTab} /> :
                activeTab === 'pdf-to-word' ? <PdfToWord setActiveTab={setActiveTab} /> :
                  activeTab === 'tools-help' ? <SettingsHelp onBack={() => setActiveTab('dashboard')} /> :
                    <Dashboard setActiveTab={setActiveTab} />}
      </main>
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}

export default App;
