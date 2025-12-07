from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
try:
    from .database import Base
except ImportError:
    from database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    category = Column(String(50))
    icon = Column(String(255)) # URL or class name for icon
    status = Column(String(20), default="active")
    url = Column(String(255)) # Launch URL

class Suggestion(Base):
    __tablename__ = "suggestions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    suggestion_id = Column(Integer, index=True)
    user_id = Column(String(36), index=True) # UUID
    vote_type = Column(String(4)) # 'up' or 'down'
