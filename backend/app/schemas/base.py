from pydantic import BaseModel, ConfigDict


def to_camel(string: str) -> str:
    """スネークケースをキャメルケースに変換"""
    components = string.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])


class CamelCaseModel(BaseModel):
    """
    キャメルケース変換を行うベースモデル

    Next.jsなどのフロントエンドはキャメルケースを使用するため、
    PythonのスネークケースとNext.jsのキャメルケースを自動変換します。

    使用例:
        class UserResponse(CamelCaseModel):
            user_id: int
            first_name: str

        # JSONレスポンス: {"userId": 1, "firstName": "John"}
    """
    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel,
        from_attributes=True
    )
