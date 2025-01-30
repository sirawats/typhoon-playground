from typing import Optional
import pytest
from sqlalchemy import Column, Integer, String
from pydantic import BaseModel, ConfigDict
from src.app.core.base_repository import BaseRepository
from tests.conftest import Base


class MockORM(Base):
    __tablename__ = "test_model"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String, nullable=True)


class MockPydantic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None
    name: str


class MockPydanticCreate(BaseModel):
    name: str
    description: Optional[str] = None


class MockPydanticUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class MockRepository(BaseRepository[MockORM]):
    pass


@pytest.fixture(scope="function")
async def repository(async_session):
    yield MockRepository(MockORM, async_session)


async def test_create(repository):
    # Test creating an item
    item = MockPydanticCreate(name="Test Item")
    created_item = await repository.create(item)
    assert created_item.id is not None
    assert created_item.name == "Test Item"


async def test_get_by_id(repository):
    # Create an item
    item = MockPydanticCreate(name="Test Item")
    created_item = await repository.create(item)

    # Test getting the item by id
    retrieved_item = await repository.get_by_id(created_item.id)
    assert retrieved_item is not None
    assert retrieved_item.id == created_item.id
    assert retrieved_item.name == "Test Item"


async def test_get_all(repository):
    items = [MockPydanticCreate(name=f"Item {i}") for i in range(5)]
    for item in items:
        await repository.create(item)

    all_items = await repository.get_all(skip=0, limit=10)
    assert len(all_items) == 5
    assert all(isinstance(item, MockORM) for item in all_items)


async def test_get_all_with_pagination(repository):
    # Create 20 items
    items = [MockPydanticCreate(name=f"Item {i}") for i in range(20)]
    for item in items:
        await repository.create(item)

    # Test first page
    page1 = await repository.get_all(skip=0, limit=10)
    assert len(page1) == 10
    assert all(item.name.startswith("Item") for item in page1)

    # Test second page
    page2 = await repository.get_all(skip=10, limit=10)
    assert len(page2) == 10
    assert all(item.name.startswith("Item") for item in page2)

    # Ensure pages don't overlap
    assert set(item.id for item in page1).isdisjoint(set(item.id for item in page2))


async def test_update(repository):
    item = MockPydanticCreate(name="Original Name")
    created_item = await repository.create(item)

    updated_item = MockPydanticUpdate(name="Updated Name")
    result = await repository.update(created_item.id, updated_item)

    assert result.id == created_item.id
    assert result.name == "Updated Name"
    assert result.description is None


async def test_update_with_partial_data(repository):
    item = MockPydanticCreate(name="Original Name", description="Original Description")
    created_item = await repository.create(item)

    partial_update = MockPydanticUpdate(description="Updated Description")
    updated_item = await repository.update(created_item.id, partial_update)

    assert updated_item.id == created_item.id
    assert updated_item.name == "Original Name"
    assert updated_item.description == "Updated Description"


async def test_delete(repository):
    item = MockPydanticCreate(name="To Be Deleted")
    created_item = await repository.create(item)

    await repository.delete(created_item.id)

    deleted_item = await repository.get_by_id(created_item.id)
    assert deleted_item is None


async def test_create_many(repository):
    items = [MockPydanticCreate(name=f"Bulk Item {i}") for i in range(3)]
    created_items = await repository.create_many(items)

    assert len(created_items) == 3
    assert all(item.id is not None for item in created_items)
    assert [item.name for item in created_items] == ["Bulk Item 0", "Bulk Item 1", "Bulk Item 2"]


async def test_get_by_id_not_found(repository):
    non_existent_id = 9999
    result = await repository.get_by_id(non_existent_id)
    assert result is None


async def test_update_not_found(repository):
    non_existent_id = 9999
    update_data = MockPydanticUpdate(name="Updated Name")

    with pytest.raises(ValueError, match=f"Item with id {non_existent_id} not found"):
        await repository.update(non_existent_id, update_data)


async def test_delete_not_found(repository):
    non_existent_id = 9999

    with pytest.raises(ValueError, match=f"Item with id {non_existent_id} not found"):
        await repository.delete(non_existent_id)
