import { useState } from "react";
import { API_BASE } from "../../Services/config";
import "./MigraStep.css";

const MigraStep = ({ sessionId, selectedPlaylists }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);
    const [progress, setProgress] = useState("");

    if (!sessionId) return null;

    const handleMigrate = async () => {
        const playlistIds = Object.entries(selectedPlaylists)
            .filter(([_, checked]) => checked)
            .map(([id]) => id);

        if (playlistIds.length === 0) {
            alert("Selecciona al menos una playlist");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setProgress("");

            // Verificar que Tidal esté autenticado
            const confirmRes = await fetch(
                `${API_BASE}/auth/tidal/confirm?session_id=${sessionId}`,
                { method: "POST" }
            );

            if (!confirmRes.ok) {
                throw new Error("Error verificando sesión con Tidal");
            }

            const confirmData = await confirmRes.json();

            if (!confirmData.authenticated) {
                throw new Error("Debes iniciar sesión en Tidal primero");
            }

            // Paso 1: Cargar todas las playlists seleccionadas
            setProgress(`Cargando ${playlistIds.length} playlist(s)...`);

            for (let i = 0; i < playlistIds.length; i++) {
                const playlistId = playlistIds[i];
                setProgress(`Cargando playlist ${i + 1} de ${playlistIds.length}...`);
                
                try {
                    await loadPlaylist(playlistId, sessionId);
                } catch (err) {
                    console.error(`Error cargando playlist ${playlistId}:`, err);
                }
            }

            // Paso 2: Migrar playlists
            setProgress("Iniciando migración a Tidal...");

            const migrateRes = await fetch(
                `${API_BASE}/tidal/playlists/migrate?session_id=${sessionId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        playlist_ids: playlistIds,
                    }),
                }
            );

            if (!migrateRes.ok) {
                const errorData = await migrateRes.json();
                throw new Error(errorData.detail || "Error migrando playlists");
            }

            setProgress("");
            setDone(true);
        } catch (err) {
            setError(err.message);
            setProgress("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="migra-step">
            <h2>4. Migra tus playlists</h2>
            <p>
                Cuando todo esté listo, inicia la migración a TIDAL.
            </p>

            <button
                onClick={handleMigrate}
                disabled={loading}
            >
                {loading ? "Procesando..." : "Migrar"}
            </button>

            {loading && (
                <div className="loading-container">
                    <div className="loader"></div>
                    {progress && <p className="progress-text">{progress}</p>}
                </div>
            )}

            {error && (
                <p className="error-text"> {error}</p>
            )}

            {done && (
                <p className="success-text">Migración completada exitosamente</p>
            )}
        </div>
    );
};

export default MigraStep;