from pydantic import BaseModel, ConfigDict
from typing import Optional


class __PLACEHOLDER__Base(BaseModel):
    # title: str
    # content: str
    pass


class __PLACEHOLDER__Create(__PLACEHOLDER__Base):
    pass


class __PLACEHOLDER__Update(BaseModel):
    # title: Optional[str] = None
    # content: Optional[str] = None
    pass


class __PLACEHOLDER__(__PLACEHOLDER__Base):
    model_config = ConfigDict(from_attributes=True)  # equals to orm_mode=True

    # id: int
    # created_at: datetime
    # updated_at: Optional[datetime] = None
    pass
