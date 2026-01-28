export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

export const fetchApplications = async () => {
    const response = await fetch(`${API_URL}/applications`);
    return response.json();
};

export const fetchSuggestions = async () => {
    const response = await fetch(`${API_URL}/suggestions`);
    return response.json();
};

export const createSuggestion = async (text) => {
    const response = await fetch(`${API_URL}/suggestions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });
    return response.json();
};

export const voteSuggestion = async (id, type, userId) => {
    const response = await fetch(`${API_URL}/suggestions/${id}/vote?vote_type=${type}&user_id=${userId}`, {
        method: "POST",
    });
    return response.json();
};
