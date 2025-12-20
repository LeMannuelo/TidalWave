import os
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from models.track import Track

def normalize_spotify_track(track: dict) -> Track:
    album_images = track["album"]["images"]

    image_url = None
    if album_images:
        image_url = album_images[0]["url"]

    return Track(
        title=track["name"],
        artist=track["artists"][0]["name"],
        album=track["album"]["name"],
        isrc=track["external_ids"].get("isrc"),
        image_url=image_url,
    )


def get_spotify_client():
    return Spotify(
        auth_manager=SpotifyOAuth(
            client_id=os.getenv("CLIENT_ID"),
            client_secret=os.getenv("CLIENT_SECRET"),
            redirect_uri="http://127.0.0.1:8000/auth/spotify/callback",
            scope=(
                "playlist-read-private "
                "playlist-read-collaborative "
                "user-library-read"
            ),
        )
    )


def get_user_playlists(sp: Spotify):
    playlists = []
    results = sp.current_user_playlists()

    while results:
        for pl in results["items"]:
            playlists.append({
                "id": pl["id"],
                "name": pl["name"],
                "image": pl["images"][0]["url"] if pl["images"] else None,
                "tracks_total": pl["tracks"]["total"],
            })
        results = sp.next(results) if results["next"] else None

    return playlists


def get_playlist_tracks(sp: Spotify, playlist_id: str):
    tracks = []
    results = sp.playlist_tracks(playlist_id)

    while results:
        for item in results["items"]:
            track = item["track"]
            if not track:
                continue

            tracks.append(normalize_spotify_track(track))

        results = sp.next(results) if results["next"] else None

    return tracks
