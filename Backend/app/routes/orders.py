from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=list[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.id.desc()).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    resolved_items = []
    seen_products = set()

    for item in order.items:
        if item.product_id in seen_products:
            raise HTTPException(
                status_code=400,
                detail=f"Duplicate product ID {item.product_id} in order",
            )
        seen_products.add(item.product_id)

        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with ID {item.product_id} not found",
            )
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Insufficient stock for '{product.name}': "
                    f"requested {item.quantity}, available {product.quantity}"
                ),
            )
        resolved_items.append((product, item.quantity))

    total_amount = sum(product.price * qty for product, qty in resolved_items)

    new_order = Order(
        customer_id=order.customer_id,
        total_amount=round(total_amount, 2),
    )
    db.add(new_order)
    db.flush()

    for product, qty in resolved_items:
        db.add(
            OrderItem(
                order_id=new_order.id,
                product_id=product.id,
                quantity=qty,
                unit_price=product.price,
            )
        )
        product.quantity -= qty

    db.commit()
    db.refresh(new_order)
    return new_order


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restore inventory when an order is cancelled/deleted
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity += item.quantity

    db.delete(order)
    db.commit()
    return {"message": f"Order #{order_id} deleted successfully"}
