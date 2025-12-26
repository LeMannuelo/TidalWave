import os
from dotenv import load_dotenv
from spotipy.oauth2 import SpotifyOAuth
from spotipy import Spotify


load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")


oauth = SpotifyOAuth(
    client_id=os.getenv("CLIENT_ID"),
    client_secret=os.getenv("CLIENT_SECRET"),
    redirect_uri=f"{BACKEND_URL}/auth/spotify/callback",
    scope=("playlist-read-private", "playlist-read-collaborative", "user-library-read"),
    cache_path=None,
)


def get_spotify_login_url():
    return oauth.get_authorize_url()


def get_spotify_token(code: str) -> str:
    token_info = oauth.get_access_token(code)
    return token_info


def get_spotify_client(access_token: str) -> Spotify:
    return Spotify(auth=access_token)
