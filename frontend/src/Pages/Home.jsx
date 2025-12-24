import Hero from "../Components/Hero/Hero";
import SpotifyStep from "../Components/Steps/SpotifyStep";
import PlaylistStep from "../Components/Steps/PlaylistStep"
import TidalStep from "../Components/Steps/TidalStep";
import MigraStep from "../Components/Steps/MigraStep";

import { useState } from "react";

const Home = ({ sessionId, setSessionId, spotifyUser, setSpotifyUser }) => {
    const [selectedPlaylists, setSelectedPlaylists] = useState({});

    return (
        <>
            <Hero />

            <SpotifyStep
                sessionId={sessionId}
                setSessionId={setSessionId}
                spotifyUser={spotifyUser}
                setSpotifyUser={setSpotifyUser}
            />

            <PlaylistStep
                sessionId={sessionId}
                selectedPlaylists={selectedPlaylists}
                setSelectedPlaylists={setSelectedPlaylists}
            />

            <TidalStep sessionId={sessionId} />

            <MigraStep
                sessionId={sessionId}
                selectedPlaylists={selectedPlaylists}
            />
        </>
    );
};

export default Home;
