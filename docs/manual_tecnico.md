# MANUAL TÉCNICO DEL SISTEMA
## Guía de Arquitectura, Instalación, Configuración y Mantenimiento

**Proyecto:** Plataforma de Capacitación Inicial Personalizada (PluriOne Enterprise)  
**Cliente / Entorno:** PluriOne S.A. de C.V.  
**Caso de Estudio:** Empresa Develop  
**Stack Tecnológico:** React.js, FastAPI (Python), PostgreSQL, Google Gemini API  
**Autor:** Carmen Adaly Flores Rendon  

---

## 1. Requisitos Previos y Entorno de Desarrollo

El sistema está diseñado para ejecutarse en cualquier entorno estándar de desarrollo web (Windows, macOS o Linux) que cuente con las siguientes herramientas básicas instaladas:

- **Python 3.11+:** Para la ejecución del servicio API REST en FastAPI y scripts de backend.
- **Node.js / npm (v18+):** Utilizado exclusivamente en desarrollo para gestionar paquetes del frontend y compilar la interfaz en React.
- **PostgreSQL 16+:** Sistema gestor de base de datos relacional (configurado localmente o en servidor).
- **Git:** Control de versiones para la gestión del repositorio.

---

## 2. Estructura y Módulos del Repositorio

El proyecto mantiene una separación clara entre la lógica del servidor (backend) y la interfaz de usuario (frontend):

```text
PluriOne-Enterprise/
├── backend/
│   ├── app/
│   │   ├── main.py              # Punto de entrada de la API FastAPI
│   │   ├── models.py            # Modelos ORM de la Base de Datos (PostgreSQL)
│   │   ├── database.py          # Conexión y gestión de sesiones a la BD
│   │   ├── services/
│   │   │   └── ai_adapter.py    # Módulo adaptador para conexión con Google Gemini API
│   │   └── routers/             # Rutas y servicios (autenticación, diagnósticos, rutas, xapi)
│   ├── seed.py                  # Script automatizado para cargar la base de datos de prueba
│   ├── requirements.txt         # Lista de librerías de Python requeridas
│   └── .env.example             # Plantilla de variables de entorno
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes visuales reutilizables
│   │   ├── pages/               # Vistas principales (Dashboards RH, Examen, Reproductor)
│   │   └── services/            # Conexión HTTP para comunicarse con el Backend
│   ├── package.json             # Dependencias de React y herramientas de construcción
│   └── vite.config.js           # Configuración del servidor de desarrollo frontend
└── README.md                    # Instrucciones generales del proyecto
```

## 3. Configuración de Variables de Entorno (.env)

Para que el backend se conecte correctamente a PostgreSQL y al motor de Inteligencia Artificial, se debe crear un archivo llamado `.env` dentro de la carpeta `backend/` tomando como base el archivo `.env.example`:

```env```
# Conexión a Base de Datos PostgreSQL
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/capacitacion_db

# Credencial para el Motor de Inteligencia Artificial
GEMINI_API_KEY=TuClaveDeApiDeGoogleGeminiAqui

4. Guía Paso a Paso de Instalación y Puesta en Marcha
Paso 1: Configurar y Desplegar el Backend (Servidor)
Abrir una terminal y navegar a la carpeta del servidor:

```bash
cd backend
```
Crear un entorno virtual de Python e instalar las librerías necesarias:
```bash
python -m venv venv
```

# Activar en Windows:
venv\Scripts\activate

# Instalar dependencias del proyecto:
pip install -r requirements.txt
Ejecutar el script automatizado para crear la base de datos y popular los datos iniciales de la empresa Develop:

```bash
python seed.py
```

Iniciar el servidor API de FastAPI:

```bash
uvicorn app.main:app --reload
```

API activa en: http://localhost:8000

Documentación interactiva disponible en: http://localhost:8000/docs

Paso 2: Configurar y Desplegar el Frontend (Interfaz Web)
En una nueva terminal, navegar a la carpeta de la interfaz:

```bash
cd frontend
```

Instalar los paquetes e iniciar el servidor de desarrollo:

```bash
npm install
npm run dev
```

Interfaz web disponible en: http://localhost:5173

5. Funcionamiento del Script de Carga Inicial (seed.py)
El script seed.py permite preparar el entorno de prueba en un solo comando sin necesidad de insertar datos manualmente:

Estructura de Base de Datos: Detecta las tablas en PostgreSQL y las crea si no existen.

Carga de Organización: Registra los departamentos y puestos del caso de estudio.

Catálogo de Contenidos: Puebla el catálogo de cursos clasificados por sus niveles (Básico, Intermedio, Avanzado).

Banco de Reactivos: Carga las preguntas y opciones del cuestionario diagnóstico inicial.

6. Mantenimiento del Sistema
Incorporación de Cursos: Nuevos contenidos agregados por el administrador desde el panel web o la base de datos son detectados automáticamente por ai_adapter.py en las recomendaciones siguientes.

Rotación de Claves: En caso de cambiar la clave de acceso a la API de Gemini o cambiar la contraseña de PostgreSQL, únicamente se edita el archivo .env del backend sin alterar el código fuente.