from pydantic import BaseModel
from typing import List, Optional
from models.track import Track


class Playlist(BaseModel):
    id: str
    name: str
    image: Optional[str]
    tracks: List[Track]
