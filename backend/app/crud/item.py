from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Item


def create_item(db: Session, title: str, description: Optional[str] = None) -> Item:
    """
    新しいアイテムを作成

    Args:
        db: データベースセッション
        title: アイテムのタイトル
        description: アイテムの説明

    Returns:
        Item: 作成されたアイテム
    """
    db_item = Item(
        title=title,
        description=description
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_item_by_id(db: Session, item_id: int) -> Optional[Item]:
    """
    IDでアイテムを取得

    Args:
        db: データベースセッション
        item_id: アイテムID

    Returns:
        Optional[Item]: アイテム、存在しない場合はNone
    """
    return db.query(Item).filter(Item.id == item_id).first()


def get_items(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> list[Item]:
    """
    アイテム一覧を取得

    Args:
        db: データベースセッション
        skip: スキップする件数
        limit: 取得する最大件数

    Returns:
        list[Item]: アイテムのリスト
    """
    return db.query(Item).order_by(Item.created_at.desc()).offset(skip).limit(limit).all()


def get_items_count(db: Session) -> int:
    """
    アイテムの総数を取得

    Args:
        db: データベースセッション

    Returns:
        int: アイテムの総数
    """
    return db.query(func.count(Item.id)).scalar()


def delete_item(db: Session, item_id: int) -> bool:
    """
    アイテムを削除

    Args:
        db: データベースセッション
        item_id: アイテムID

    Returns:
        bool: 削除に成功した場合True、アイテムが存在しない場合False
    """
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False


def update_item(
    db: Session,
    item_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None
) -> Optional[Item]:
    """
    アイテムを更新

    Args:
        db: データベースセッション
        item_id: アイテムID
        title: 新しいタイトル（Noneの場合は更新しない）
        description: 新しい説明（Noneの場合は更新しない）

    Returns:
        Optional[Item]: 更新されたアイテム、存在しない場合はNone
    """
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if db_item:
        if title is not None:
            db_item.title = title
        if description is not None:
            db_item.description = description
        db.commit()
        db.refresh(db_item)
        return db_item
    return None
