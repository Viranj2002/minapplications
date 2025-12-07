import React, { useEffect, useState } from 'react';
import { fetchSuggestions, createSuggestion, voteSuggestion } from '../api';

const SuggestionBoard = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [newSuggestion, setNewSuggestion] = useState("");

    const loadSuggestions = () => {
        fetchSuggestions().then(setSuggestions);
    };

    useEffect(() => {
        loadSuggestions();
    }, []);

    const getUserId = () => {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = crypto.randomUUID();
            localStorage.setItem('userId', userId);
        }
        return userId;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newSuggestion.trim()) return;
        await createSuggestion(newSuggestion);
        setNewSuggestion("");
        loadSuggestions();
    };

    const handleVote = async (id, type) => {
        const userId = getUserId();
        await voteSuggestion(id, type, userId);
        loadSuggestions();
    };

    return (
        <div className="suggestion-board">
            <h1>Suggestions</h1>
            <p>Suggest new applications to be added!</p>

            <form onSubmit={handleSubmit} className="suggestion-form">
                <textarea
                    value={newSuggestion}
                    onChange={(e) => setNewSuggestion(e.target.value)}
                    placeholder="I suggest adding..."
                />
                <button type="submit">Submit Suggestion</button>
            </form>

            <div className="suggestion-list">
                {suggestions.map((s) => (
                    <div key={s.id} className="suggestion-card">
                        <div className="suggestion-content">
                            <p>{s.text}</p>
                            <span className="date">{new Date(s.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="vote-controls">
                            <button onClick={() => handleVote(s.id, 'up')} className="vote-btn up">
                                ▲ {s.upvotes}
                            </button>
                            <button onClick={() => handleVote(s.id, 'down')} className="vote-btn down">
                                ▼ {s.downvotes}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestionBoard;
