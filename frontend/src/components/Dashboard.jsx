import React, { useEffect, useState } from 'react';
import { fetchApplications } from '../api';
import SuggestionBoard from './SuggestionBoard';

const Dashboard = ({ setActiveTab }) => {
    const [apps, setApps] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [pinnedApps, setPinnedApps] = useState(() => {
        const saved = localStorage.getItem('pinnedApps');
        return saved ? JSON.parse(saved) : [];
    });
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        fetchApplications().then(setApps);
    }, []);

    useEffect(() => {
        localStorage.setItem('pinnedApps', JSON.stringify(pinnedApps));
    }, [pinnedApps]);

    const handleLaunch = (appName) => {
        if (appName === 'Image to PDF') {
            setActiveTab('pdf-converter');
        } else if (appName === 'Image Compressor') {
            setActiveTab('image-compressor');
        } else if (appName === 'Word to PDF') {
            setActiveTab('word-to-pdf');
        } else if (appName === 'PDF to Word') {
            setActiveTab('pdf-to-word');
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const togglePin = (appId) => {
        setPinnedApps(prev => {
            if (prev.includes(appId)) {
                return prev.filter(id => id !== appId);
            } else {
                return [...prev, appId];
            }
        });
        setOpenMenuId(null);
    };

    const toggleMenu = (appId, e) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === appId ? null : appId);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        if (openMenuId) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [openMenuId]);

    // Filter applications based on search query
    const filteredApps = apps.filter((app) => {
        const query = searchQuery.toLowerCase();
        return (
            app.name.toLowerCase().includes(query) ||
            app.category.toLowerCase().includes(query)
        );
    });

    // Sort apps: pinned apps first, then unpinned apps in their original order
    const sortedApps = [...filteredApps].sort((a, b) => {
        const aIsPinned = pinnedApps.includes(a.id);
        const bIsPinned = pinnedApps.includes(b.id);

        if (aIsPinned && !bIsPinned) return -1;
        if (!aIsPinned && bIsPinned) return 1;
        return 0; // Maintain original order for apps in the same category (both pinned or both unpinned)
    });

    const getAppIcon = (iconIdentifier) => {
        const iconStyle = { width: '48px', height: '48px', objectFit: 'contain' };

        // Map identifiers to local paths
        const iconMap = {
            'image-to-pdf': '/icons/image-to-pdf.png',
            'image-compressor': '/icons/image-compressor.png',
            'word-to-pdf': '/icons/word-to-pdf.png',
            'pdf-to-word': '/icons/pdf-to-word.png'
        };

        const localPath = iconMap[iconIdentifier];

        if (localPath) {
            return <img src={localPath} alt={iconIdentifier} className="app-icon" style={iconStyle} />;
        }

        // Fallback for full URLs
        if (iconIdentifier && (iconIdentifier.startsWith('http') || iconIdentifier.startsWith('data:'))) {
            return <img src={iconIdentifier} alt="App Icon" className="app-icon" style={iconStyle} onError={(e) => { e.target.src = 'https://via.placeholder.com/50' }} />;
        }

        // Default SVG fallback
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="M12 8v8M8 12h8" />
            </svg>
        );
    };


    return (
        <div className="dashboard-container-split">
            <div className="dashboard-left">
                <div className="header">
                    <h1>Applications</h1>
                    <div className="search-bar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="profile-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                </div>
                <div className="app-grid">
                    {sortedApps.map((app) => (
                        <div key={app.id} className="app-card">
                            <div className="app-header">
                                {getAppIcon(app.icon)}
                                <div className="app-menu-container">
                                    <div className="app-menu" onClick={(e) => toggleMenu(app.id, e)}>⋮</div>
                                    {openMenuId === app.id && (
                                        <div className="app-dropdown">
                                            <div className="dropdown-item" onClick={() => togglePin(app.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                                </svg>
                                                <span>{pinnedApps.includes(app.id) ? 'Unpin from Favorites' : 'Pin to Favorites'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {pinnedApps.includes(app.id) && (
                                <div className="pin-indicator">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                    </svg>
                                </div>
                            )}
                            <h3>{app.name}</h3>
                            <p>{app.category}</p>
                            <button className="launch-btn" onClick={() => handleLaunch(app.name)}>Launch</button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="dashboard-right">
                <SuggestionBoard />
            </div>
        </div>
    );
};

export default Dashboard;
