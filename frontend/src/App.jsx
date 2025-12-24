import { useState } from "react";
import Home from "./Pages/Home";

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [spotifyUser, setSpotifyUser] = useState(null);

  return (
    <Home
      sessionId={sessionId}
      setSessionId={setSessionId}
      spotifyUser={spotifyUser}
      setSpotifyUser={setSpotifyUser}
    />
  );
}

export default App;