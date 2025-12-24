const API_BASE = "http://127.0.0.1:8000";

export async function getTidalLoginUrl(sessionId) {
    const res = await fetch(
        `${API_BASE}/auth/tidal/login?session_id=${sessionId}`,
        { method: "POST" }
    );

    if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
    }

    return res.json();
}
