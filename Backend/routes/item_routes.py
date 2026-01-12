from fastapi import APIRouter, HTTPException
from schemas.item_create import ItemCreate
from repositories.item_repo import create_item, get_all_items


router = APIRouter(prefix="/items", tags=["Items"])


@router.post("/add")
def add_item(item: ItemCreate):
    try:
        item_id = create_item(item)
        return {"item_id": item_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/all")
def see_all_items():
    try:
        items = get_all_items()
        return items
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
