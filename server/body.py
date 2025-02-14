from typing import Any, Type
from marshmallow import ValidationError

def read_as[T](body: Any, schema_type: T) -> T | None:
    schema = schema_type()
    try:
        return schema.load(body)
    except ValidationError as err:
        return None