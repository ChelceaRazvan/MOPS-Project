from fastapi import FastAPI
from database import engine, Base
from routes.register_routes import router as register_router
from routes.login_routes import router as login_router
from fastapi.middleware.cors import CORSMiddleware


from routes import (contact_routes,
                    supplier_routes,
                    item_routes)

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(register_router)  
app.include_router(login_router)

app.include_router(contact_routes.router)
app.include_router(supplier_routes.router)
app.include_router(item_routes.router)     


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"hello": "world"}
