from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id")
    )

    total_amount = Column(Float, nullable=False)

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)

    order_id = Column(
        Integer,
        ForeignKey("orders.id")
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id")
    )

    quantity = Column(Integer)

    unit_price = Column(Float)

    order = relationship(
        "Order",
        back_populates="items"
    )