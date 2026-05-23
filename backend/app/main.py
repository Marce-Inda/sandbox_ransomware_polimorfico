import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.core import config

app = FastAPI(
    title="AI Worm & Defense Sandbox API",
    description="Backend educativo para simulación de inyecciones semánticas de prompt auto-replicantes (Morris II) y auditoría defensiva.",
    version="1.0.0"
)

# Configurar CORS para permitir peticiones locales desde la interfaz de desarrollo de Vite (frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar enrutador de la API
app.mount("/api", api_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "AI Worm & Defense Sandbox API is active. Mount points are available under /api"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host=config.HOST, port=config.PORT, reload=True)
