import tidalapi


def start_tidal_login():
    session = tidalapi.Session()
    login_info = session.login_oauth_simple()
    return session, login_info
