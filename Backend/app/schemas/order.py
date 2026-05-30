from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    unit_price: float

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    customer_id: int = Field(..., gt=0)
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderResponse(BaseModel):
    id: int
    customer_id: Optional[int]
    total_amount: float
    created_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
