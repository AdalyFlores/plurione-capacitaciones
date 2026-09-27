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
    
def generar_evaluacion_final(puesto_nombre: str, cursos_asignados: list):
    """
    Genera un examen de 5 preguntas por cada curso asignado usando Gemini.
    Usa la librería google.genai con reintentos para error 503.
    """
    
    # Extraer nombres de los cursos asignados
    nombres_cursos = [
        c.get("titulo") or c.get("nombre") or str(c) 
        for c in cursos_asignados
    ]
    
    total_cursos = len(nombres_cursos)
    total_preguntas = total_cursos * 5

    # 1. Construcción del Prompt
    prompt = f"""
    Actúa como un evaluador técnico y académico experto.
    
    PUESTO DEL EVALUADO: {puesto_nombre}
    CURSOS COMPLETADOS: {json.dumps(nombres_cursos, ensure_ascii=False)}

    TAREA:
    Genera un examen de opción múltiple para evaluar los conocimientos adquiridos.
    Debes generar exactamente 5 preguntas por cada uno de los {total_cursos} cursos asignados (Total: {total_preguntas} preguntas).

    REGLAS DE FORMATO:
    1. "opciones": Debe ser una lista de 4 alternativas de texto.
    2. "respuesta_correcta": Un número entero entre 0 y 3 indicando el índice de la opción correcta en la lista.
    3. Retorna ÚNICAMENTE la estructura JSON especificada a continuación:

    {{
      "titulo": "Evaluación Final de Capacitación",
      "total_preguntas": {total_preguntas},
      "preguntas": [
        {{
          "id": 1,
          "curso_asociado": "Nombre exacto de uno de los cursos",
          "pregunta": "¿Texto de la pregunta técnica?",
          "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
          "respuesta_correcta": 1,
          "explicacion": "Explicación breve de por qué es la respuesta correcta."
        }}
      ]
    }}
    """

    # 2. Configuración de Reintentos
    max_retries = 3
    delay = 2

    for intento in range(max_retries):
        try:
            # Llamada al modelo Gemini
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )

            texto_limpio = response.text.strip()
            if texto_limpio.startswith("```json"):
                texto_limpio = texto_limpio.replace("```json", "", 1).rstrip("```").strip()
            
            return json.loads(texto_limpio)

        except APIError as e:
            if getattr(e, 'code', None) == 503 and intento < max_retries - 1:
                tiempo_espera = delay * (intento + 1)
                print(f"[IA Retry Exam] Servidor ocupado (503). Reintentando en {tiempo_espera}s...")
                time.sleep(tiempo_espera)
                continue
            print(f"Error en API de Gemini (Examen): {e}")
            break

        except Exception as e:
            print(f"Error inesperado al generar examen con IA: {e}")
            break

    # 3. Fallback (Por si falla la IA)
    print("[IA Fallback Exam] Generando preguntas de respaldo.")
    return {
        "titulo": "Evaluación Final (Modo Respaldo)",
        "total_preguntas": total_preguntas,
        "preguntas": [
            {
                "id": idx + 1,
                "curso_asociado": nombre_curso,
                "pregunta": f"Pregunta de validación general sobre: {nombre_curso}",
                "opciones": ["Concepto básico A", "Concepto correcto B", "Concepto C", "Concepto D"],
                "respuesta_correcta": 1,
                "explicacion": "Respuesta generada en modo de contingencia."
            }
            for idx, nombre_curso in enumerate(nombres_cursos)
        ]
    }