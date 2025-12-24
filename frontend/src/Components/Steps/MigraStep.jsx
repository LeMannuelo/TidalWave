import { useState } from "react";

const MigraStep = ({ sessionId, selectedPlaylists }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);

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

            // Confirmar login en Tidal
            const confirmRes = await fetch(
                `http://127.0.0.1:8000/auth/tidal/confirm?session_id=${sessionId}`,
                { method: "POST" }  
            );

            if (!confirmRes.ok) {
                throw new Error("Error confirmando sesión con Tidal");
            }

            const confirmData = await confirmRes.json();
            console.log("Respuesta Tidal confirm:", confirmData); // Para debugging

            if (!confirmData.authenticated) {
                throw new Error("La sesión con Tidal no está confirmada");
            }

            // Migrar playlists
            const migrateRes = await fetch(
                `http://127.0.0.1:8000/tidal/playlists/migrate?session_id=${sessionId}`,
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
                console.error("Error en migración:", errorData);
                throw new Error(errorData.detail || "Error migrando playlists");
            }

            const migrateData = await migrateRes.json();
            console.log("Resultado migración:", migrateData);

            setDone(true);
        } catch (err) {
            console.error("Error completo:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="spotify-step">
            <h2>4. Migra tus playlists</h2>
            <p>
                Cuando todo esté listo, inicia la migración a Tidal.
            </p>

            <button
                color="#e2241a"
                onClick={handleMigrate}
                disabled={loading}
                className={loading ? "loading" : ""}
            >
                {loading ? "Migrando..." : "Migrar"}
            </button>

            {error && (
                <p style={{ color: "#ff6b6b", marginTop: "1rem" }}>
                    {error}
                </p>
            )}

            {done && (
                <p style={{ color: "#e2241a", marginTop: "1rem" }}>
                    Migración completada exitosamente
                </p>
            )}
        </div>
    );
};

export default MigraStep;