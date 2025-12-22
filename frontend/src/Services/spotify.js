const API_BASE = "http://127.0.0.1:8000";

export async function getSpotifyLoginUrl() {
    const res = await fetch(`${API_BASE}/auth/spotify/login`);
    return res.json();
}
