import tidalapi

_tidal_sessions = {}

def start_tidal_login(session_id: str):
    session = tidalapi.Session()

    oauth, _ = session.login_oauth()

    _tidal_sessions[session_id] = session

    return {
        "login_url": oauth.verification_uri_complete,
        "expires_in": oauth.expires_in
    }


def confirm_tidal_login(session_id: str):
    session = _tidal_sessions.get(session_id)

    if not session:
        raise Exception("Sesión TIDAL no encontrada")

    if session.user is not None:
        return {
            "authenticated": True,
            "user": {
                "id": session.user.id,
                "username": session.user.username
            }
        }

    return {
        "authenticated": False
    }