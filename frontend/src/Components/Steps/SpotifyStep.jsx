import {useState, useEffect} from "react";
import "./SpotifyStep.css";
import { API_BASE } from "../../Services/config"; 

const SpotifyStep = ({ sessionId, setSessionId, spotifyUser, setSpotifyUser }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar si hay datos de sesión en la URL (después del callback)
        const params = new URLSearchParams(window.location.search);
        const session = params.get("session_id");
        const userId = params.get("user_id");
        const userName = params.get("user_name");

        if (session && userId && !sessionId) {
            // Guardar los datos en el estado
            setSessionId(session);
            setSpotifyUser({
                id: userId,
                display_name: userName
            });
            
            // Limpiar la URL sin recargar la página
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        setLoading(false);
    }, [sessionId, setSessionId, setSpotifyUser]);

    const handleLogin = async () => {
        try {
            const data = await getSpotifyLoginUrl();
            window.location.href = data.login_url;
        } catch (error) {
            console.error("Error al obtener URL de login:", error);
            alert("Error al conectar con Spotify");
        }
    };

    if (loading) {
        return (
            <div className="spotify-step">
                <h2>1. Vincula tu cuenta de Spotify</h2>
                <p>Cargando...</p>
            </div>
        );
    }

    return (
        <div className="spotify-step">
            <h2>1. Vincula tu cuenta de Spotify</h2>

            {spotifyUser ? (
                <div className="user-connected">
                    <p>Conectado como: <strong>{spotifyUser.display_name}</strong></p>
                    <p style={{ fontSize: "0.9em", color: "#888" }}>
                        Session ID: {sessionId.slice(0, 8)}...
                    </p>
                </div>
            ) : (
                <button onClick={handleLogin}>
                    Conectar con Spotify
                </button>
            )}
        </div>
    );
};

export default SpotifyStep;
