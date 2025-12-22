from fastapi import FastAPI, HTTPException, Query, Header
from fastapi.responses import RedirectResponse, JSONResponse
import uuid
from models.playlist import Playlist
from typing import List
from pydantic import BaseModel
from services.tidal_service import create_tidal_playlist


class MigrateRequest(BaseModel):
    playlist_ids: List[str]


sessions = {}

from auth.spotify import (
    get_spotify_login_url,
    get_spotify_token,
    get_spotify_client,
)

from services.spotify_service import (
    get_user_playlists,
    get_playlist_tracks,
)

from auth.tidal import start_tidal_login

app = FastAPI(title="Spotify → TIDAL Migrator")


# SPOTIFY AUTH
@app.get("/auth/spotify/login")
def spotify_login():
    url = get_spotify_login_url()
    return {"login_url": url}


@app.get("/auth/spotify/callback")
def spotify_callback(code: str = Query(...)):
    try:
        token_info = get_spotify_token(code)
        sp = get_spotify_client(token_info["access_token"])

        user = sp.current_user()
        session_id = str(uuid.uuid4())

        sessions[session_id] = {
            "spotify_token": token_info["access_token"],
            "spotify_user": {
                "id": user["id"],
                "display_name": user["display_name"],
            },
            "spotify_playlists": None,
            "spotify_tracks": {},
        }

        return {
            "message": "Spotify autenticado",
            "session_id": session_id,
            "user": sessions[session_id]["spotify_user"],
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# TIDAL AUTH
@app.get("/auth/tidal/login")
def tidal_login(session_id: str = Query(...)):
    session = sessions.get(session_id)

    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    tidal_session, login_info = start_tidal_login()

    session["tidal_session"] = tidal_session

    return {
        "message": "Autoriza TIDAL usando el código",
        "login_info": login_info,
    }


# SPOTIFY DATA
def spotify_client_from_session(session_id: str):
    session = sessions.get(session_id)

    if not session or "spotify_token" not in session:
        raise HTTPException(status_code=401, detail="Invalid session")

    return get_spotify_client(session["spotify_token"])


@app.get("/spotify/playlists")
def spotify_playlists(session_id: str = Query(...)):
    session = sessions.get(session_id)

    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Si hay sesión, devolver
    if session["spotify_playlists"] is not None:
        return session["spotify_playlists"]

    # Si no, pedirlas a Spotify
    sp = get_spotify_client(session["spotify_token"])
    playlists = get_user_playlists(sp)

    session["spotify_playlists"] = playlists
    return playlists


@app.get("/spotify/playlists/{playlist_id}/tracks")
def spotify_playlist_tracks(playlist_id: str, session_id: str = Query(...)):
    session = sessions.get(session_id)

    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Cache por playlist
    if playlist_id in session["spotify_tracks"]:
        return session["spotify_tracks"][playlist_id]

    sp = get_spotify_client(session["spotify_token"])
    tracks = get_playlist_tracks(sp, playlist_id)

    session["spotify_tracks"][playlist_id] = tracks
    return tracks


# SPOTIFY PLAYLISTS WITH TRACKS
@app.post("/spotify/playlists/{playlist_id}/load")
def load_spotify_playlist(playlist_id: str, session_id: str = Query(...)):
    session = sessions.get(session_id)

    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Comprobar si ya está cargada
    if "normalized_playlists" not in session:
        session["normalized_playlists"] = {}

    if playlist_id in session["normalized_playlists"]:
        return session["normalized_playlists"][playlist_id]

    sp = get_spotify_client(session["spotify_token"])

    # Metadata de la playlist
    playlists = session.get("spotify_playlists") or []
    meta = next((p for p in playlists if p["id"] == playlist_id), None)

    if not meta:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Normalizar tracks
    tracks = get_playlist_tracks(sp, playlist_id)

    playlist = Playlist(
        id=playlist_id,
        name=meta["name"],
        image=meta["image"],
        tracks=tracks,
    )

    session["normalized_playlists"][playlist_id] = playlist
    return playlist


# PLAYLIST MIGRATION
@app.post("/tidal/playlists/migrate")
def migrate_playlists(body: MigrateRequest, session_id: str = Query(...)):
    session = sessions.get(session_id)

    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    if "tidal_session" not in session:
        raise HTTPException(status_code=400, detail="TIDAL not authenticated")

    if "normalized_playlists" not in session:
        raise HTTPException(status_code=400, detail="No playlists loaded")

    tidal = session["tidal_session"]

    results = []

    for playlist_id in body.playlist_ids:
        playlist = session["normalized_playlists"].get(playlist_id)

        if not playlist:
            results.append(
                {
                    "playlist_id": playlist_id,
                    "status": "skipped",
                    "reason": "not loaded",
                }
            )
            continue

        # TIDAL MIGRATION LOGIC HERE
        result = create_tidal_playlist(tidal, playlist.name, playlist.tracks)

        results.append(
            {
                "playlist_id": playlist_id,
                "name": playlist.name,
                "status": "migrated",
                "added": result["added"],
                "not_found": result["not_found"],
            }
        )

    return {"message": "Migration prepared", "results": results}
