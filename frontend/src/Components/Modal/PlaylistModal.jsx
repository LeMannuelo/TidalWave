import { useEffect, useState } from "react";
import "./PlaylistModal.css";
import { loadPlaylist } from "../../Services/spotify";

const PlaylistModal = ({ playlist, sessionId, onClose }) => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        loadPlaylist(playlist.id, sessionId)
            .then(data => setTracks(data.tracks))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [playlist.id, sessionId]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{playlist.name}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-content">
                    {loading ? (
                        <p>Cargando canciones…</p>
                    ) : (
                        tracks.map((t, i) => (
                            <div key={i} className="track-item">
                                <img src={t.image_url} alt="" />
                                <div className="track-text">
                                    <div className="track-title">{t.title}</div>
                                    <div className="meta">
                                        {t.artist} · {t.album}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlaylistModal;