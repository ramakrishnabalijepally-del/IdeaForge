from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class CategoryType(str, enum.Enum):
    startup = "startup"
    manufacturing = "manufacturing"


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    type = Column(Enum(CategoryType), nullable=False)
    description = Column(String(500), nullable=True)

    ideas = relationship("Idea", back_populates="category")
