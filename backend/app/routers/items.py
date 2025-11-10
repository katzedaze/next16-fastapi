from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.crud.item import (
    create_item,
    get_item_by_id,
    get_items,
    get_items_count,
    delete_item,
    update_item
)
from app.schemas.item import (
    ItemCreateRequest,
    ItemResponse,
    ItemListResponse
)

router = APIRouter(prefix="/api/items", tags=["items"])


@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_new_item(
    request: ItemCreateRequest,
    db: Session = Depends(get_db)
):
    """
    アイテム作成エンドポイント

    新しいアイテムを作成します。

    フロントエンド送信データ (camelCase):
    ```json
    {
        "title": "Sample Item",
        "description": "This is a sample item"
    }
    ```

    レスポンス (camelCase):
    ```json
    {
        "id": 1,
        "title": "Sample Item",
        "description": "This is a sample item",
        "createdAt": "2025-11-10T00:00:00Z",
        "updatedAt": "2025-11-10T00:00:00Z"
    }
    ```
    """
    item = create_item(
        db=db,
        title=request.title,
        description=request.description
    )
    return ItemResponse.model_validate(item)


@router.get("", response_model=ItemListResponse)
def get_items_list(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    アイテム一覧取得エンドポイント

    アイテムの一覧を取得します（ページネーション対応）。

    クエリパラメータ:
    - skip: スキップする件数（デフォルト: 0）
    - limit: 取得する最大件数（デフォルト: 100）

    レスポンス (camelCase):
    ```json
    {
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
    ```
    """
    items = get_items(db=db, skip=skip, limit=limit)
    total = get_items_count(db=db)

    return ItemListResponse(
        items=[ItemResponse.model_validate(item) for item in items],
        total=total
    )


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    """
    アイテム詳細取得エンドポイント

    指定されたIDのアイテムを取得します。

    レスポンス (camelCase):
    ```json
    {
        "id": 1,
        "title": "Sample Item",
        "description": "This is a sample item",
        "createdAt": "2025-11-10T00:00:00Z",
        "updatedAt": "2025-11-10T00:00:00Z"
    }
    ```
    """
    item = get_item_by_id(db=db, item_id=item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return ItemResponse.model_validate(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item_by_id(
    item_id: int,
    db: Session = Depends(get_db)
):
    """
    アイテム削除エンドポイント

    指定されたIDのアイテムを削除します。
    """
    success = delete_item(db=db, item_id=item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return None
