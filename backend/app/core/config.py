import os
from dotenv import load_dotenv

# Cargar variables desde el archivo .env si existe
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "127.0.0.1")

# Configuraciones de IA y modelo
DEFAULT_MODEL = "gemini-1.5-flash"
TEMPERATURE = 0.0  # Máxima consistencia y baja alucinación para los guardrails de ciberseguridad
