import os
import json
import time
from google import genai
from google.genai import types
from google.genai.errors import APIError
from dotenv import load_dotenv

load_dotenv()

# Inicialización del cliente oficial de Google GenAI
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generar_ruta_aprendizaje(puesto_nombre: str, respuestas_diagnostico: list, cursos_disponibles: list):
    """
    Genera una ruta de aprendizaje personalizada en formato JSON usando Gemini.
    Incluye lógica de reintentos para manejar errores temporales 503 (Servidor Ocupado).
    """
    
    # 1. Construcción del Prompt
    prompt = f"""
    Actúa como un experto en Capacitación y Desarrollo de Talento Humano.
    
    PUESTO EVALUADO: {puesto_nombre}
    RESPUESTAS DEL DIAGNÓSTICO: {json.dumps(respuestas_diagnostico, ensure_ascii=False)}
    CATÁLOGO DE CURSOS DISPONIBLES: {json.dumps(cursos_disponibles, ensure_ascii=False)}

    TAREA:
    1. Analiza las brechas de conocimiento del usuario según sus respuestas.
    2. Selecciona de los cursos disponibles los más adecuados para cerrar esas brechas.
    3. Devuelve la respuesta ÚNICAMENTE en formato JSON estructurado como el siguiente esquema:

    {{
      "puesto": "{puesto_nombre}",
      "resumen_brechas": "Breve descripción clínica de las fortalezas y áreas a mejorar.",
      "ruta": [
        {{
          "id_curso": 1,
          "titulo": "Nombre del Curso",
          "tipo": "OBLIGATORIO",
          "orden_secuencia": 1,
          "justificacion": "Razón pedagógica por la que debe tomar este curso",
          "plazo_dias": 30
        }}
      ]
    }}
    """

    # 2. Configuración de Reintentos (Backoff Exponencial)
    max_retries = 3
    delay = 2  # segundos base de espera

    for intento in range(max_retries):
        try:
            # Llamada al modelo recomendado gemini-3.6-flash
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            # Limpieza básica de respuesta y parseo JSON
            texto_limpio = response.text.strip()
            if texto_limpio.startswith("```json"):
                texto_limpio = texto_limpio.replace("```json", "", 1).rstrip("```").strip()
            
            return json.loads(texto_limpio)

        except APIError as e:
            # Si el error es 503 (Servidor ocupado) y aún nos quedan intentos, esperamos y reintentamos
            if getattr(e, 'code', None) == 503 and intento < max_retries - 1:
                tiempo_espera = delay * (intento + 1)
                print(f"[IA Retry] Servidor ocupado (503). Reintentando en {tiempo_espera}s... (Intento {intento + 1}/{max_retries})")
                time.sleep(tiempo_espera)
                continue
            
            print(f"Error en API de Gemini: {e}")
            break

        except Exception as e:
            print(f"Error inesperado al procesar la respuesta de IA: {e}")
            break

    # 3. Ruta de Fallback (Si fallan los 3 intentos o hay otro error)
    print("[IA Fallback] Entregando ruta de respaldo predeterminada.")
    return {
        "puesto": puesto_nombre,
        "resumen_brechas": "No se pudo conectar con el motor de IA en este momento. Se asignan cursos prioritarios del catálogo.",
        "ruta": [
            {
                "id_curso": c.get("id"),
                "titulo": c.get("titulo"),
                "tipo": "OBLIGATORIO",
                "orden_secuencia": idx + 1,
                "justificacion": "Asignación estándar por catálogo debido a mantenimiento temporal de IA.",
                "plazo_dias": 30
            }
            for idx, c in enumerate(cursos_disponibles[:3])
        ]
    }