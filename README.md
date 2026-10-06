# Plataforma de Capacitación Inicial Personalizada

**Alumno:** Carmen Adaly Flores Rendon · **Matrícula:** G19X-ITSA-CAFR-166  
**Institución:** Instituto Tecnológico Superior de Atlixco  

## Qué hace

Es una plataforma web para el proceso de capacitación del personal de nuevo ingreso. Aunque es una solución genérica diseñada para adaptarse a los planes de estudio y requerimientos de cualquier empresa u organización, para efectos de esta evaluación está configurada y cargada con el contenidos de PluriOne S.A. de C.V.

El sistema funciona en tres etapas clave:
1. **Evaluación Diagnóstica:** Aplica un examen inicial al nuevo colaborador para identificar sus conocimientos previos, fortalezas y áreas de oportunidad.
2. **Generación Adaptativa de Rutas:** Conecta los resultados con la API de Google Gemini (IA) para construir dinámicamente una ruta de aprendizaje personalizada, priorizando los temas que el usuario realmente necesita reforzar.
3. **Seguimiento y Administración:** Ofrece un módulo administrativo para dar seguimiento al avance de los colaboradores, gestionar diagnósticos y evaluar la efectividad de la capacitación.

## Qué necesitas instalado

- Python 3.11+
- Node.js 18+
- PostgreSQL 16+

## Base de datos

1. Crea una base vacía llamada `plurione_db`.
2. Para cargar la estructura y datos de prueba, ejecuta desde la carpeta `backend/`:

python seed.py

## Configuración

Copia `.env.example` a `.env` en la carpeta `backend/` y llena los valores (los reales están en «Accesos de prueba», en Mis documentos).

## Cómo instalarlo y ejecutarlo

**Backend (FastAPI):**

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

**Frontend (React + Vite):**

cd frontend
npm install
npm run dev

Se abre en http://localhost:5173

## Usuario de prueba

Administrador (RH): ana.rojas@plurione.com / password123  
Empleado (Dev): carlos.mendoza@plurione.com / password123  
Empleado (Ventas): mariana.gomez@plurione.com / password123


## Lo que todavía no funciona

- El inicio de sesión con cuenta de Microsoft es una simulación de interfaz para fines del entorno de prueba local (no conecta a un Azure Active Directory / Tenant de producción real).