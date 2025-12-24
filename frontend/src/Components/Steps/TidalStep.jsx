import { useState } from "react";
import { getTidalLoginUrl } from "../../Services/tidal";
import "./TidalStep.css";

const TidalStep = ({ sessionId }) => {
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);

    if (!sessionId) return null;

    const handleLogin = async () => {
        try {
            setLoading(true);
            const data = await getTidalLoginUrl(sessionId);

            let url = data.login_url;
            if (!url.startsWith("http")) {
                url = "https://" + url;
            }

            // Abrimos TIDAL en otra pestaña
            window.open(url, "_blank", "noopener,noreferrer");

            setStarted(true);
        } catch (err) {
            console.error(err);
            alert("Error al iniciar sesión con TIDAL");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tidal-step">
            <h2>3. Vincula tu cuenta de TIDAL</h2>

            {started ? (
                <p className="hint">
                    Completa el inicio de sesión en la pestaña de TIDAL.
                    <br />
                    Cuando termines, vuelve aquí para continuar.
                </p>
            ) : (
                <button onClick={handleLogin} disabled={loading}>
                    {loading ? "Conectando..." : "Conectar con TIDAL"}
                </button>
            )}
        </div>
    );
};

export default TidalStep;
