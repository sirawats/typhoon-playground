from abc import ABC, abstractmethod
from contextlib import asynccontextmanager
import re
from uuid import UUID
from asyncpg import ForeignKeyViolationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Any, Type, TypeVar, Generic
from sqlalchemy.exc import IntegrityError


T = TypeVar("T")

ID = int | str | UUID


class RepositoryAbstract(ABC):
    """
    Abstract base class defining the interface for asynchronous repositories.
    """

    @abstractmethod
    async def get_all(self, skip: int, limit: int):
        """Retrieve all items with pagination."""
        raise NotImplementedError

    @abstractmethod
    async def get_by_id(self, id: ID):
        """Retrieve an item by its ID."""
        raise NotImplementedError

    @abstractmethod
    async def create(self, item):
        """Create a new item."""
        raise NotImplementedError

    @abstractmethod
    async def update(self, id: ID, item):
        """Update an existing item."""
        raise NotImplementedError

    @abstractmethod
    async def delete(self, id: ID):
        """Delete an item by its ID."""
        raise NotImplementedError


class BaseRepository(RepositoryAbstract, Generic[T]):
    """
    Base repository class for ORM models, implementing CRUD operations.

    This class serves as a foundation for creating service classes that interact with the database.
    It provides generic implementations for common database CRUD operations.
    Usually, methods receive a Pydantic model and return a ORM model.

    Usage:
        To create a service for a specific model, subclass BaseRepository and specify the ORM model:

        ```python
        class UserRepo(BaseRepository[orm.User]):
            pass
        ```

    Type Parameters:
        T: The SQLAlchemy ORM model type this repository will work with.


    Note:
        This class assumes that the ORM model has an 'id' attribute. If not, some methods may raise
        an AttributeError.
    """

    orm_model: Type[T]
    session: AsyncSession

    def __init__(self, orm_model: Type[T], session: AsyncSession):
        """
        Initialize the repository with an ORM model and database session.
        """
        self.session = session
        self.orm_model = orm_model

    @staticmethod
    def __table_name_from_message(error_message: str) -> str | None:
        """
        Extract table name from an error message.
        """
        pattern = r'table "(.+?)"'
        match = re.search(pattern, error_message)
        return match.group(1) if match else None

    @asynccontextmanager
    async def transaction(self, autocommit: bool = True):
        """
        Context manager for database transactions.
        """
        try:
            yield
            if autocommit:
                await self.session.commit()
        except Exception:
            await self.session.rollback()
            raise

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[T]:
        """
        Retrieve all items with pagination.
        """
        result = await self.session.execute(select(self.orm_model).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def get_by_id(self, id: ID) -> T | None:
        """
        Retrieve an item by its ID.
        """
        if not hasattr(self.orm_model, "id"):
            raise AttributeError(f"{self.orm_model.__name__} must have an 'id' attribute")
        result = await self.session.execute(select(self.orm_model).filter(getattr(self.orm_model, "id") == id))
        return result.scalar_one_or_none()

    async def create(self, item: T, attributes: list[str] = []) -> T:
        """
        Create a new item.
        """
        try:
            self.session.add(item)
            await self.session.commit()
            await self.session.refresh(item, attributes)
            return item
        except IntegrityError as alchemy_error:
            await self.session.rollback()
            if isinstance(alchemy_error.orig, ForeignKeyViolationError):
                table_name = self.__table_name_from_message(str(alchemy_error.orig))
                if isinstance(table_name, str):
                    formatted = " ".join(table_name.split("_"))
                    raise ValueError(f"{formatted} id does not exist")
            raise

    async def create_many(self, items: list[T]) -> list[T]:
        """
        Create multiple items at once.
        """
        try:
            self.session.add_all(items)
            await self.session.commit()
            return items
        except IntegrityError as alchemy_error:
            await self.session.rollback()
            if isinstance(alchemy_error.orig, ForeignKeyViolationError):
                table_name = self.__table_name_from_message(str(alchemy_error.orig))
                if isinstance(table_name, str):
                    formatted = " ".join(table_name.split("_"))
                    raise ValueError(f"{formatted} id does not exist")
            raise

    async def update(self, id: ID, update_data: dict[str, Any], attributes: list[str] = []) -> T:
        """
        Update an existing item.
        """
        db_item = await self.get_by_id(id)
        if not db_item:
            raise ValueError(f"Item with id {id} not found")

        for key, value in update_data.items():
            setattr(db_item, key, value)

        await self.session.commit()
        await self.session.refresh(db_item, attributes)
        return db_item

    async def delete(self, id: ID) -> None:
        """
        Delete an item by its ID.
        """
        db_item = await self.get_by_id(id)
        if not db_item:
            raise ValueError(f"Item with id {id} not found")

        await self.session.delete(db_item)
        await self.session.commit()
