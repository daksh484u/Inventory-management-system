from pydantic import BaseModel, Field, ConfigDict


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sku: str = Field(..., min_length=1, max_length=64)
    price: float = Field(..., gt=0)
    quantity: int = Field(..., ge=0)


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    price: float
    quantity: int

    model_config = ConfigDict(from_attributes=True)
