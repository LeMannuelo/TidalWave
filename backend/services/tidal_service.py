import tidalapi
from models.track import Track


def find_tidal_track(session: tidalapi.Session, track: Track):
    # isrc search (visaje)
    if track.isrc:
        results = session.search(query=track.isrc, models=[tidalapi.Track])
        if results["tracks"]:
            return results["tracks"][0]

    # nombre + artista + album
    query = f"{track.title} {track.artist}"
    results = session.search(query=query, models=[tidalapi.Track])

    if results["tracks"]:
        return results["tracks"][0]

    return None

def create_tidal_playlist(
    session: tidalapi.Session,
    playlist_name: str,
    tracks: list[Track],
):
    user = session.user
    tidal_playlist = user.create_playlist(
        playlist_name,
        "Migrada desde Spotify usando TidalWave",
    )

    added = 0
    not_found = []

    for track in tracks:
        tidal_track = find_tidal_track(session, track)

        if tidal_track:
            tidal_playlist.add([tidal_track.id])
            added += 1
        else:
            not_found.append(f"{track.title} - {track.artist}")

    return {
        "playlist_name": playlist_name,
        "added": added,
        "not_found": not_found,
    }
