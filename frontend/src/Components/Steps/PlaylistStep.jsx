import { useEffect, useState } from "react";
import { getPlaylists } from "../../Services/spotify";
import "./PlaylistStep.css";
import PlaylistModal from "../Modal/PlaylistModal";

const PlaylistStep = ({ sessionId, selectedPlaylists, setSelectedPlaylists }) => {
    const [playlists, setPlaylists] = useState([]); // ✅ FALTABA
    const [activePlaylist, setActivePlaylist] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!sessionId) return;

        setLoading(true);
        getPlaylists(sessionId)
            .then(data => {
                setPlaylists(data);

                const initialSelected = {};
                data.forEach(pl => {
                    initialSelected[pl.id] = true;
                });

                setSelectedPlaylists(initialSelected);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [sessionId, setSelectedPlaylists]);

    if (!sessionId) return null;

    return (
        <div className="playlist-step">
            <h2>2. Selecciona tus playlists</h2>

            {loading ? (
                <p>Cargando playlists…</p>
            ) : (
                <ul className="playlist-list">
                    {playlists.map(p => (
                        <li key={p.id} className="playlist-item">
                            <input
                                type="checkbox"
                                checked={!!selectedPlaylists[p.id]}
                                onChange={() =>
                                    setSelectedPlaylists(prev => ({
                                        ...prev,
                                        [p.id]: !prev[p.id],
                                    }))
                                }
                            />

                            <img
                                src={p.image}
                                alt=""
                                onClick={() => setActivePlaylist(p)}
                            />

                            <div
                                className="playlist-info"
                                onClick={() => setActivePlaylist(p)}
                            >
                                <strong>{p.name}</strong>
                                <span>{p.tracks_total} canciones</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {activePlaylist && (
                <PlaylistModal
                    playlist={activePlaylist}
                    sessionId={sessionId}
                    onClose={() => setActivePlaylist(null)}
                />
            )}
        </div>
    );
};

export default PlaylistStep;
