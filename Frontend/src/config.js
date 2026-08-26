const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    // In production browser environments (e.g. Render), default to relative URL if VITE_API_BASE_URL is not set
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        return "";
    }
    return "http://localhost:8080";
};

export const API_BASE_URL = getApiBaseUrl();

