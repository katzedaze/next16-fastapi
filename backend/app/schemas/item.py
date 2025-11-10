from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ItemBase(BaseModel):
    """
    アイテム基本スキーマ
    """
    title: str = Field(..., min_length=1, max_length=255, description="アイテムのタイトル")
    description: Optional[str] = Field(None, description="アイテムの説明")


class ItemCreateRequest(ItemBase):
    """
    アイテム作成リクエスト（camelCaseで受け取る）
    """
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "title": "Sample Item",
                "description": "This is a sample item for testing cache behavior"
            }
        }
    )


class ItemResponse(ItemBase):
    """
    アイテムレスポンス（camelCaseで返す）
    """
    id: int
    created_at: datetime = Field(..., serialization_alias="createdAt")
    updated_at: Optional[datetime] = Field(None, serialization_alias="updatedAt")

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "title": "Sample Item",
                "description": "This is a sample item",
                "createdAt": "2025-11-10T00:00:00Z",
                "updatedAt": "2025-11-10T00:00:00Z"
            }
        }
    )


class ItemListResponse(BaseModel):
    """
    アイテム一覧レスポンス
    """
    items: list[ItemResponse]
    total: int

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "items": [
                    {
                        "id": 1,
                        "title": "Sample Item",
                        "description": "This is a sample item",
                        "createdAt": "2025-11-10T00:00:00Z",
                        "updatedAt": "2025-11-10T00:00:00Z"
                    }
                ],
                "total": 1
            }
        }
    )
