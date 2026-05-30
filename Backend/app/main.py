import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import Base, engine
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.routes.products import router as product_router
from app.routes.customers import router as customer_router
from app.routes.orders import router as order_router

load_dotenv()

Base.metadata.create_all(bind=engine)

DEFAULT_CORS = (
    "http://localhost,http://localhost:80,http://localhost:5173,"
    "http://127.0.0.1,http://127.0.0.1:80,http://127.0.0.1:5173"
)
cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", DEFAULT_CORS).split(",")
    if origin.strip()
]

app = FastAPI(
    title="Inventory & Order Management API",
    description="Production API for products, customers, and orders",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product_router)
app.include_router(customer_router)
app.include_router(order_router)


@app.get("/")
def root():
    return {"message": "Inventory & Order Management API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
