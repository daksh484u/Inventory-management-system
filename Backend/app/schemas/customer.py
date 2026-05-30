from pydantic import BaseModel, EmailStr, Field, ConfigDict


class CustomerCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=30)


class CustomerResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str

    model_config = ConfigDict(from_attributes=True)
