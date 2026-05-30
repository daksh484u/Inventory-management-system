from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.customer import CustomerCreate, CustomerResponse

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("", response_model=list[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).order_by(Customer.id).all()


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("", response_model=CustomerResponse, status_code=201)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(Customer).filter(Customer.email == customer.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_customer = Customer(**customer.model_dump())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    has_orders = db.query(Order).filter(Order.customer_id == customer_id).first()
    if has_orders:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete customer with existing orders",
        )

    db.delete(customer)
    db.commit()
    return {"message": "Customer deleted successfully"}
