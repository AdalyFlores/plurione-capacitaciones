import os
import models
from datetime import date, datetime, timezone
from typing import List # List sí viene de typing
from pydantic import BaseModel # BaseModel viene de pydantic
from dotenv import load_dotenv

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Carga de variables de entorno (.env)
load_dotenv()

from database import engine, get_db
# Importación del adaptador con la nueva librería google-genai
from services.ai_adapter import generar_ruta_aprendizaje

# Crear tablas en PostgreSQL si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configuración de CORS para conexión fluida con el Frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ESQUEMAS DE PYDANTIC ---

class UserRegister(BaseModel):
    nombre: str
    email: str
    password: str
    rol: str = "empleado"
    departamento: str = ""
    puesto: str = ""

class LoginData(BaseModel):
    email: str
    password: str

class DiagnosticoData(BaseModel):
    email: str
    departamento: str
    puesto: str

class GenerarRutaRequest(BaseModel):
    puesto_id: str
    score: int

class GuardarDiagnosticoRequest(BaseModel):
    usuario_id: int
    puesto_id: str
    score: int

class CursoCreate(BaseModel):
    titulo: str
    descripcion: str = ""
    duracion: str
    nivel: str
    categoria: str
    puesto_id: str
    url_contenido: str = ""

class CursoResponse(CursoCreate):
    id: int

    class Config:
        from_attributes = True

# --- DATOS ESTÁTICOS / SIMULADOS EN MEMORIA ---

DB_PERFILES = {
    "departamentos": [
        {"id": "tecnologia", "nombre": "Desarrollo de Software"},
        {"id": "ventas", "nombre": "Administración y Ventas"},
    ],
    "puestos": {
        "tecnologia": [
            {"id": "dev", "nombre": "Desarrollador Backend"},
        ],
        "ventas": [
            {"id": "recruiter", "nombre": "Especialista en Marketing Digital"},
        ]
    }
}

DB_EXAMENES = {
    "dev": {
        "titulo": "Evaluación Diagnóstica: Desarrollador Backend",
        "duracion_minutos": 10,
        "preguntas": [
            {
                "id": 1,
                "texto": "¿Cuál es tu nivel global de experiencia en desarrollo de software?",
                "opciones": [
                    "1. Trainee / Junior (0-1 años)",
                    "2. Mid-level (2-4 años)",
                    "3. Senior (5+ años)"
                ]
            },
            {
                "id": 2,
                "texto": "¿Cuál es tu nivel de dominio en la creación y arquitectura de servidores Backend?",
                "opciones": [
                    "1. Básico (Scripts simples o controladores básicos)",
                    "2. Intermedio (APIs REST con FastAPI, Express o Django)",
                    "3. Avanzado (Patrones de diseño, Microservicios y Async I/O)",
                    "4. Experto (Arquitecturas distribuidas, Event-Driven y Alta Disponibilidad)"
                ]
            },
            {
                "id": 3,
                "texto": "¿Qué tan familiarizado estás con la creación, consumo y seguridad de APIs REST?",
                "opciones": [
                    "1. Solo las he consumido desde el Frontend",
                    "2. He creado APIs básicas y rutas simples",
                    "3. Diseño arquitecturas REST estructuradas con autenticación (JWT/OAuth)",
                    "4. Manejo optimización, seguridad avanzada, rate limiting y documentación OpenAPI"
                ]
            },
            {
                "id": 4,
                "texto": "¿Cómo ha sido tu experiencia gestionando bases de datos en proyectos reales?",
                "opciones": [
                    "1. Poca interacción / Solo teoría",
                    "2. Consultas intermedias (CRUD y consultas simples)",
                    "3. Modelado de tablas, relaciones (3FN) y uso de ORMs (SQLAlchemy, Prisma)",
                    "4. Optimización de consultas complejas, indexación y migración de datos"
                ]
            },
            {
                "id": 5,
                "texto": "¿Cuál es tu flujo habitual para asegurar la calidad de tu código y entrega continua?",
                "opciones": [
                    "1. Uso básico de Git y revisiones manuales",
                    "2. Manejo fluido de Git (branches, PRs) y pruebas unitarias básicas",
                    "3. Escribo pruebas automatizadas (TDD) e integro pipelines de CI/CD",
                    "4. Diseño estrategias globales de arquitectura, testing y entrega continua"
                ]
            }
        ]
    },
    "recruiter": {
        "titulo": "Evaluación Diagnóstica: Especialista en Marketing Digital",
        "duracion_minutos": 10,
        "preguntas": [
            {
                "id": 1,
                "texto": "¿En qué área de marketing digital tienes mayor experiencia técnica?",
                "opciones": [
                    "1. Redes Sociales y Creación de Contenido (Orgánico)",
                    "2. Publicidad Pagada (Meta Ads, Google Ads)",
                    "3. SEO y Posicionamiento en Buscadores",
                    "4. Estrategia Inbound, Email Marketing y Embudos completos"
                ]
            },
            {
                "id": 2,
                "texto": "¿Cómo interpretas las métricas de rendimiento en tus campañas?",
                "opciones": [
                    "1. Reviso métricas básicas (Likes, Alcance, Clics)",
                    "2. Configuro píxeles de seguimiento y mido conversiones (CPA, CTR)",
                    "3. Analizo el retorno de inversión completo (ROAS, CAC, LTV) en Google Analytics",
                    "4. Construyo dashboards automatizados (Looker Studio/Power BI) para decisiones estratégicas"
                ]
            },
            {
                "id": 3,
                "texto": "¿Qué nivel de experiencia tienes usando plataformas de CRM o automatización?",
                "opciones": [
                    "1. Ninguno / Solo listas de correo sencillas",
                    "2. Uso básico de CRM (Mailchimp, HubSpot) para envíos masivos",
                    "3. Creo secuencias de nutrición de leads y segmentaciones automáticas",
                    "4. Integro flujos complejos entre campañas, CRM y herramientas No-Code (Zapier/Make)"
                ]
            },
            {
                "id": 4,
                "texto": "¿Cómo abordas la mejora continua de tus contenidos o anuncios?",
                "opciones": [
                    "1. Cambio el texto o la imagen de manera intuitiva cuando no funciona",
                    "2. Realizo pruebas A/B sencillas en anuncios o páginas",
                    "3. Diseño experimentos basados en hipótesis y análisis del comportamiento del usuario",
                    "4. Optimizo embudos completos mediante CRO (Conversion Rate Optimization) y UX copywriting"
                ]
            },
            {
                "id": 5,
                "texto": "¿Cuál es tu experiencia administrando presupuestos de inversión publicitaria?",
                "opciones": [
                    "1. Sin experiencia en presupuestos de pauta",
                    "2. Presupuestos pequeños (menos de $500 USD/mes)",
                    "3. Presupuestos medianos y gestión directa de pauta escalar ($500 a $5,000 USD/mes)",
                    "4. Estrategias omnicanal con presupuestos elevados y optimización de capital"
                ]
            }
        ]
    }
}

# --- RUTAS DE AUTENTICACIÓN Y PERFILES ---

@app.get("/")
def home():
    return {"status": "API Activa", "sistema": "PluriOne Capacitaciones"}

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def registrar_usuario(data: UserRegister, db: Session = Depends(get_db)):
    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email == data.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El correo ya está registrado.")

    nuevo_usuario = models.Usuario(
        nombre=data.nombre,
        email=data.email,
        password=data.password,
        rol=data.rol,
        departamento=data.departamento,
        puesto=data.puesto
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return {
        "status": "ok",
        "mensaje": "Usuario creado exitosamente",
        "user": {
            "id": nuevo_usuario.id,
            "nombre": nuevo_usuario.nombre,
            "email": nuevo_usuario.email,
            "rol": nuevo_usuario.rol
        }
    }

@app.post("/api/auth/login")
def login(data: LoginData, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == data.email).first()

    if not usuario or usuario.password != data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos."
        )

    return {
        "status": "ok",
        "user": {
            "id": usuario.id,
            "email": usuario.email,
            "nombre": usuario.nombre,
            "rol": usuario.rol,
            "departamento": usuario.departamento,
            "puesto": usuario.puesto
        }
    }

@app.get("/api/perfiles")
def obtener_perfiles():
    return DB_PERFILES

@app.post("/api/diagnostico/iniciar")
def iniciar_diagnostico(data: DiagnosticoData):
    exam = DB_EXAMENES.get(data.puesto)
    if not exam:
        raise HTTPException(status_code=404, detail="No hay examen disponible para este puesto.")
    
    return {
        "status": "ok",
        "sesion_id": "SESION-88492",
        "examen": exam
    }

# --- GENERACIÓN DE RUTAS E INTELIGENCIA ARTIFICIAL ---

@app.post("/api/rutas/generar-ia")
def generar_ruta_ia(payload: dict, db: Session = Depends(get_db)):
    puesto_id_str = str(payload.get("puesto_id", "dev"))
    usuario_id = payload.get("usuario_id") 

    nombres_puestos = {
        "dev": "Desarrollador Backend",
        "recruiter": "Especialista en Marketing Digital"
    }
    puesto_nombre = nombres_puestos.get(puesto_id_str, puesto_id_str)

    # 1. Obtener cursos desde PostgreSQL
    cursos_db = db.query(models.Curso).filter(models.Curso.puesto_id == puesto_id_str).all()
    if not cursos_db:
        cursos_db = db.query(models.Curso).all()

    # 2. Convertir lista de objetos a diccionarios
    catalogo_cursos = [
        {
            "id": c.id,
            "titulo": c.titulo,
            "descripcion": getattr(c, 'descripcion', '') or "",
            "duracion": getattr(c, 'duracion', '') or "",
            "nivel": getattr(c, 'nivel', '') or "",
            "categoria": getattr(c, 'categoria', '') or "",
            "puesto_id": getattr(c, 'puesto_id', '') or ""
        }
        for c in cursos_db
    ]

    # 3. Invocar al motor de Gemini mediante ai_adapter
    try:
        resultado_ia = generar_ruta_aprendizaje(
            puesto_nombre=puesto_nombre,
            respuestas_diagnostico=payload.get("respuestas", []),
            cursos_disponibles=catalogo_cursos
        )
    except Exception as e:
        print(f"Error procesando endpoint de IA: {e}")
        resultado_ia = {
            "puesto": puesto_nombre,
            "resumen_brechas": "No se pudo procesar con IA. Cursos asignados directamente por catálogo.",
            "ruta": [
                {
                    "id_curso": c["id"],
                    "titulo": c["titulo"],
                    "tipo": "OBLIGATORIO",
                    "orden_secuencia": idx + 1,
                    "justificacion": "Asignado por catálogo por defecto",
                    "plazo_dias": 30
                }
                for idx, c in enumerate(catalogo_cursos[:4])
            ]
        }

    # 4. Guardar resultado en PostgreSQL
    nueva_ruta = None
    if usuario_id:
        try:
            nueva_ruta = models.RutaAprendizaje(
                id_usuario=int(usuario_id),
                orden_secuencia_json=resultado_ia,
                fecha_asignacion=date.today()
            )
            db.add(nueva_ruta)
            db.commit()
            db.refresh(nueva_ruta)
        except Exception as e:
            db.rollback()
            print(f"Error al guardar ruta en BD: {e}")

    return {
        "status": "ok",
        "mensaje": "Ruta generada exitosamente",
        "id_ruta": nueva_ruta.id_ruta if nueva_ruta else None,
        "ruta": resultado_ia
    }

@app.post("/api/diagnostico/guardar")
def guardar_diagnostico(data: GuardarDiagnosticoRequest, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == data.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="El usuario especificado no existe.")

    nuevo_diagnostico = models.Diagnostico(
        usuario_id=data.usuario_id,
        puesto_evaluado=data.puesto_id,
        score=data.score
    )

    db.add(nuevo_diagnostico)
    db.commit()
    db.refresh(nuevo_diagnostico)

    return {
        "status": "ok",
        "mensaje": "Diagnóstico registrado exitosamente",
        "diagnostico": {
            "id": nuevo_diagnostico.id,
            "usuario_id": nuevo_diagnostico.usuario_id,
            "puesto_id": nuevo_diagnostico.puesto_evaluado,
            "score": nuevo_diagnostico.score,
            "fecha": nuevo_diagnostico.fecha
        }
    }

# --- GESTIÓN DE CURSOS (PANEL DE RRHH) ---

@app.post("/api/cursos", status_code=status.HTTP_201_CREATED)
def crear_curso(curso: CursoCreate, db: Session = Depends(get_db)):
    nuevo_curso = models.Curso(**curso.model_dump())
    db.add(nuevo_curso)
    db.commit()
    db.refresh(nuevo_curso)
    return {"status": "ok", "mensaje": "Curso creado exitosamente", "curso": nuevo_curso}

@app.get("/api/cursos")
def listar_cursos(puesto_id: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Curso)
    if puesto_id:
        query = query.filter(models.Curso.puesto_id == puesto_id)
    cursos = query.all()
    return {"status": "ok", "total": len(cursos), "cursos": cursos}

@app.delete("/api/cursos/{curso_id}")
def eliminar_curso(curso_id: int, db: Session = Depends(get_db)):
    curso = db.query(models.Curso).filter(models.Curso.id == curso_id).first()
    if not curso:
        raise HTTPException(status_code=404, detail="El curso no existe.")
    
    db.delete(curso)
    db.commit()
    return {"status": "ok", "mensaje": "Curso eliminado correctamente"}

@app.get("/api/rutas/usuario/{usuario_id}")
def obtener_ruta_usuario(usuario_id: int, db: Session = Depends(get_db)):
    ruta = db.query(models.RutaAprendizaje)\
             .filter(models.RutaAprendizaje.id_usuario == usuario_id)\
             .order_by(models.RutaAprendizaje.id_ruta.desc())\
             .first()

    if not ruta:
        raise HTTPException(status_code=404, detail="El usuario no tiene una ruta de aprendizaje guardada.")

    return {
        "status": "ok",
        "id_ruta": ruta.id_ruta,
        "fecha_asignacion": ruta.fecha_asignacion,
        "ruta": ruta.orden_secuencia_json
    }

# --- TRACKING DE PROGRESO Y FORMATO xAPI ---

def generar_xapi_statement(usuario, curso, estatus: str, calificacion: float = None):
    verbos_xapi = {
        "En progreso": {
            "id": "http://adlnet.gov/expapi/verbs/initialized",
            "display": {"es": "inicio"}
        },
        "Completado": {
            "id": "http://adlnet.gov/expapi/verbs/completed",
            "display": {"es": "completo"}
        }
    }

    verbo = verbos_xapi.get(
        estatus, 
        {"id": "http://adlnet.gov/expapi/verbs/progressed", "display": {"es": "avanzo"}}
    )

    email_usuario = getattr(usuario, 'email', None) or getattr(usuario, 'correo', None) or f"usuario{usuario.id}@plurione.com"
    nombre_usuario = getattr(usuario, 'nombre', None) or f"Usuario {usuario.id}"

    statement = {
        "actor": {
            "mbox": f"mailto:{email_usuario}",
            "name": nombre_usuario,
            "objectType": "Agent"
        },
        "verb": verbo,
        "object": {
            "id": f"http://plurione.com/cursos/{curso.id}",
            "definition": {
                "name": {"es": curso.titulo},
                "description": {"es": getattr(curso, 'descripcion', 'Curso de capacitacion')}
            },
            "objectType": "Activity"
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    if calificacion is not None and estatus == "Completado":
        statement["result"] = {
            "score": {
                "scaled": float(calificacion) / 100.0,
                "raw": float(calificacion)
            },
            "completion": True
        }

    return statement

@app.post("/api/progreso/actualizar")
def actualizar_progreso(payload: dict, db: Session = Depends(get_db)):
    usuario_id = payload.get("id_usuario")
    curso_id = payload.get("id_curso")
    nuevo_estatus = payload.get("estatus", "En progreso")
    calificacion = payload.get("calificacion", None)

    if not usuario_id or not curso_id:
        raise HTTPException(status_code=400, detail="id_usuario e id_curso son requeridos.")

    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    curso = db.query(models.Curso).filter(models.Curso.id == curso_id).first()

    if not usuario or not curso:
        raise HTTPException(status_code=404, detail="Usuario o Curso no encontrado.")

    progreso = db.query(models.ProgresoCurso).filter(
        models.ProgresoCurso.id_usuario == usuario_id,
        models.ProgresoCurso.id_curso == curso_id
    ).first()

    if progreso:
        progreso.estatus = nuevo_estatus
        if calificacion is not None:
            progreso.calificacion = calificacion
    else:
        progreso = models.ProgresoCurso(
            id_usuario=usuario_id,
            id_curso=curso_id,
            estatus=nuevo_estatus,
            calificacion=calificacion
        )
        db.add(progreso)

    db.commit()
    db.refresh(progreso)

    xapi_statement = generar_xapi_statement(usuario, curso, nuevo_estatus, calificacion)

    return {
        "status": "ok",
        "mensaje": "Progreso actualizado correctamente",
        "progreso": {
            "id_progreso": progreso.id_progreso,
            "id_usuario": progreso.id_usuario,
            "id_curso": progreso.id_curso,
            "estatus": progreso.estatus,
            "calificacion": progreso.calificacion
        },
        "xapi_statement": xapi_statement
    }

@app.get("/api/progreso/usuario/{usuario_id}")
def obtener_progreso_usuario(usuario_id: int, db: Session = Depends(get_db)):
    progresos = db.query(models.ProgresoCurso).filter(models.ProgresoCurso.id_usuario == usuario_id).all()
    
    return {
        "status": "ok",
        "usuario_id": usuario_id,
        "progresos": [
            {
                "id_progreso": p.id_progreso,
                "id_curso": p.id_curso,
                "estatus": p.estatus,
                "calificacion": p.calificacion
            }
            for p in progresos
        ]
    }