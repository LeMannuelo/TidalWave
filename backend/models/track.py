from pydantic import BaseModel
from typing import Optional


class Track(BaseModel):
    title: str
    artist: str
    album: str
    isrc: Optional[str]
    image_url: Optional[str]