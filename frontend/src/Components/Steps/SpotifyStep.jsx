import "./Steps.css";

const SpotifyStep = () => {
    const handleLogin = () => {
        window.location.href = "http://127.0.0.1:8000/auth/spotify/login";
    };

    return (
        <div className="spotify-step">
            <h2>1. Vincula tu cuenta de Spotify</h2>

            <button onClick={handleLogin}>
                Conectar con Spotify
            </button>
        </div>
    );
};

export default SpotifyStep;
