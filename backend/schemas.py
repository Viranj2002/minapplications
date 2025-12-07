from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Application Schemas
class ApplicationBase(BaseModel):
    name: str
    category: str
    icon: str
    url: str

class ApplicationCreate(ApplicationBase):
    pass

class Application(ApplicationBase):
    id: int
    status: str

    class Config:
        from_attributes = True

# Suggestion Schemas
class SuggestionBase(BaseModel):
    text: str

class SuggestionCreate(SuggestionBase):
    pass

class Suggestion(SuggestionBase):
    id: int
    upvotes: int
    downvotes: int
    created_at: datetime

    class Config:
        from_attributes = True
