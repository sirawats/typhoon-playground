import copy
from typing import Any, ChainMap, Optional, TypeVar, Union, get_args, get_origin

from pydantic import BaseModel, ConfigDict, TypeAdapter
from pydantic._internal._model_construction import ModelMetaclass
from pydantic.alias_generators import to_camel
from pydantic.fields import FieldInfo


class CamelModel(BaseModel):
    """
    Base model that automatically converts snake_case to camelCase.
    All schema models should inherit from this class.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,  # Accept both camelCase and snake_case formats
        from_attributes=True,  # Allow SQLAlchemy model conversion
    )


T = TypeVar("T", bound=BaseModel)


class PartialMeta(ModelMetaclass):
    """Enhanced metaclass for creating partial versions of Pydantic models.

    Features:
    - Supports multiple inheritance
    - Handles nested types (List[Model], Dict[str, Model])
    - Optimized field processing
    - Compatible with Pydantic v2 features
    """

    def __new__(
        mcs,
        cls_name: str,
        bases: tuple[type[Any], ...],
        namespace: dict[str, Any],
        remove_length_constraint: bool = False,
        **kwargs: Any,
    ) -> type[T]:
        # Support multiple inheritance by merging fields from all bases
        base_fields = ChainMap(*(base.model_fields for base in bases if issubclass(base, BaseModel)))

        if not base_fields:
            raise TypeError("At least one base class must inherit from BaseModel")

        annotations: dict[str, Any] = {}
        processed_fields: dict[str, FieldInfo] = {}

        def make_optional(annotation: Any) -> Any:
            origin = get_origin(annotation)

            # Handle collections (List, Dict, etc.)
            if origin is not None:
                args = get_args(annotation)
                # Recursively make nested types optional
                optional_args = tuple(make_optional(arg) for arg in args)
                return Optional[origin[optional_args]]

            # Handle nested models
            if isinstance(annotation, type) and issubclass(annotation, BaseModel):
                return Optional[annotation]

            # Handle unions
            if origin is Union:
                return Optional[annotation]

            return Optional[annotation]

        # Process fields using TypeAdapter for better performance
        for field_name, field_info in base_fields.items():
            if field_name.startswith("__"):
                continue

            new_field = copy.deepcopy(field_info)
            new_field.annotation = make_optional(field_info.annotation)
            new_field.default = None if new_field.default is ... else new_field.default

            if remove_length_constraint:
                new_field.metadata = [m for m in new_field.metadata if not any(isinstance(m, c) for c in (min, max))]
                new_field._attributes_set = {
                    k: v for k, v in new_field._attributes_set.items() if k not in ("min_length", "max_length")
                }

            annotations[field_name] = new_field.annotation
            processed_fields[field_name] = new_field

        # Update namespace
        namespace.update(processed_fields)
        namespace["__annotations__"] = annotations

        # Add model config for better validation performance
        namespace["model_config"] = ConfigDict(validate_assignment=True, populate_by_name=True, extra="allow")

        return super().__new__(mcs, cls_name, bases, namespace, **kwargs)

    def __init__(cls, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        TypeAdapter(cls)
