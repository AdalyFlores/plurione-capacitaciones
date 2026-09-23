import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Inicializa el cliente oficial de Gemini usando la clave del .env
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generar_ruta_aprendizaje(puesto_nombre: str, respuestas_diagnostico: list, cursos_disponibles: list) -> dict:
    prompt = f"""
    Eres el motor adaptativo de capacitación para la plataforma PluriOne S.A. de C.V.
    
    INFORMACIÓN DEL EMPLEADO:
    - Puesto: {puesto_nombre}
    - Respuestas de la evaluación diagnóstica: {json.dumps(respuestas_diagnostico, ensure_ascii=False)}
    
    CATÁLOGO DE CURSOS DISPONIBLES EN BASE DE DATOS (PostgreSQL):
    {json.dumps(cursos_disponibles, ensure_ascii=False)}
    
    REGLAS ESTRICTAS DE NEGOCIO:
    1. Utiliza ÚNICAMENTE los cursos del catálogo proporcionado. NO inventes ni sugieras recursos externos.
    2. Aplica la regla 70/30: 
       - 70% Cursos Obligatorios (asignados para cubrir las brechas o debilidades detectadas en el diagnóstico).
       - 30% Cursos Opcionales (desarrollo profesional o complemento).
    3. Dosifica un máximo de 2 a 3 cursos por mes (2-4 horas de estudio mensual).
    
    Devuelve ÚNICAMENTE un JSON válido con la siguiente estructura:
    {{
        "puesto": "{puesto_nombre}",
        "resumen_brechas": "Breve explicación de las brechas detectadas",
        "ruta": [
            {{
                "id_curso": 1,
                "titulo": "Nombre exacto del curso",
                "tipo": "OBLIGATORIO",
                "orden_secuencia": 1,
                "justificacion": "Explicación de por qué se asigna este curso según el diagnóstico",
                "plazo_dias": 30
            }}
        ]
    }}
    """

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    return json.loads(response.text)