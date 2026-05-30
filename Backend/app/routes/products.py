from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.order import OrderItem
from app.schemas.product import ProductCreate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.sku == product.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")

    new_product = Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.get("", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.id).all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductCreate,
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    sku_taken = (
        db.query(Product)
        .filter(Product.sku == product_data.sku, Product.id != product_id)
        .first()
    )
    if sku_taken:
        raise HTTPException(status_code=400, detail="SKU already exists")

    for field, value in product_data.model_dump().items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    in_orders = db.query(OrderItem).filter(OrderItem.product_id == product_id).first()
    if in_orders:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete product referenced by orders",
        )

    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}
