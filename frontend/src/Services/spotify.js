const API_BASE = "http://127.0.0.1:8000";

export async function getSpotifyLoginUrl() {
    const res = await fetch(`${API_BASE}/auth/spotify/login`);
    if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
    }
    return res.json();
}

export async function getPlaylists(sessionId) {
    const res = await fetch(`${API_BASE}/spotify/playlists?session_id=${sessionId}`);
    if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
    }
    return res.json();
}

export async function loadPlaylist(playlistId, sessionId) {
    const res = await fetch(
        `http://127.0.0.1:8000/spotify/playlists/${playlistId}/load?session_id=${sessionId}`,
        { method: "POST" }
    );

    if (!res.ok) {
        throw new Error(`Error ${res.status}`);
    }

    return res.json();
}
