from dotenv import load_dotenv

load_dotenv()  # Carga el archivo .env al arrancar la app

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from services.ai_adapter import generar_ruta_aprendizaje


from database import engine, get_db
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



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

CATALOGO_RRHH = {
    "dev": [
        {"id": 101, "titulo": "Fundamentos de FastAPI y APIs RESTful", "duracion": "4h", "nivel": "Básico", "categoria": "APIs"},
        {"id": 102, "titulo": "PostgreSQL, SQLAlchemy y Modelado de Datos", "duracion": "6h", "nivel": "Intermedio", "categoria": "Bases de Datos"},
        {"id": 103, "titulo": "Seguridad Avanzada en Backend (JWT, OAuth2 y Rate Limit)", "duracion": "5h", "nivel": "Avanzado", "categoria": "APIs"},
        {"id": 104, "titulo": "Optimización de Consultas SQL e Indexación", "duracion": "4h", "nivel": "Avanzado", "categoria": "Bases de Datos"},
        {"id": 105, "titulo": "Testing Automatizado y Pipelines CI/CD con Git", "duracion": "5h", "nivel": "Intermedio", "categoria": "Buenas Prácticas"},
        {"id": 106, "titulo": "Patrones de Diseño y Microservicios", "duracion": "8h", "nivel": "Avanzado", "categoria": "Arquitectura"},
        {"id": 107, "titulo": "Habilidades Blandas para Desarrolladores Backend", "duracion": "3h", "nivel": "Básico", "categoria": "Soft Skills"},
    ],
    "recruiter": [
        {"id": 201, "titulo": "Configuración de Píxeles y Medición de Conversiones", "duracion": "4h", "nivel": "Intermedio", "categoria": "Analítica"},
        {"id": 202, "titulo": "Estrategia Avanzada de Meta Ads & Google Ads", "duracion": "6h", "nivel": "Intermedio", "categoria": "Pauta"},
        {"id": 203, "titulo": "Google Analytics 4 (GA4) y Dashboards en Looker", "duracion": "5h", "nivel": "Avanzado", "categoria": "Analítica"},
        {"id": 204, "titulo": "Automatización con CRM (HubSpot y Zapier)", "duracion": "5h", "nivel": "Avanzado", "categoria": "Automatización"},
        {"id": 205, "titulo": "Diseño de Experimentos A/B y Optimización CRO", "duracion": "4h", "nivel": "Avanzado", "categoria": "Experimentos"},
        {"id": 206, "titulo": "Copywriting y Redacción para Embudos de Venta", "duracion": "3h", "nivel": "Básico", "categoria": "Contenido"},
    ]
}


@app.get("/")
def home():
    return {"status": "API Activa", "sistema": "PluriOne Capacitaciones"}


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def registrar_usuario(data: UserRegister, db: Session = Depends(get_db)):
    """ Endpoint para dar de alta usuarios directamente en PostgreSQL """
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
    """ Consulta en la base de datos PostgreSQL si las credenciales son válidas """
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


from datetime import date

@app.post("/api/rutas/generar-ia")
def generar_ruta_ia(payload: dict, db: Session = Depends(get_db)):
    puesto_id_str = str(payload.get("puesto_id"))
    usuario_id = payload.get("usuario_id")  

    cursos_db = db.query(models.Curso).filter(models.Curso.puesto_id == puesto_id_str).all()
    if not cursos_db:
        raise HTTPException(status_code=404, detail="No se encontraron cursos para este puesto.")

    catalogo_cursos = [
        {
            "id": c.id,
            "titulo": c.titulo,
            "descripcion": c.descripcion or "",
            "duracion": c.duracion or "",
            "nivel": c.nivel or "",
            "categoria": c.categoria or ""
        }
        for c in cursos_db
    ]

    resultado_ia = generar_ruta_aprendizaje(
        puesto_nombre="Desarrollador Backend",
        respuestas_diagnostico=payload.get("respuestas", []),
        cursos_disponibles=catalogo_cursos
    )

    
    nueva_ruta = None
    if usuario_id:
        nueva_ruta = models.RutaAprendizaje(
            id_usuario=int(usuario_id),
            orden_secuencia_json=resultado_ia,
            fecha_asignacion=date.today()
        )
        db.add(nueva_ruta)
        db.commit()
        db.refresh(nueva_ruta)

    return {
        "status": "ok",
        "mensaje": "Ruta guardada en BD exitosamente" if usuario_id else "Ruta generada sin guardar",
        "id_ruta": nueva_ruta.id_ruta if nueva_ruta else None,
        "ruta": resultado_ia
    }


@app.post("/api/diagnostico/guardar")
def guardar_diagnostico(data: GuardarDiagnosticoRequest, db: Session = Depends(get_db)):
    """ Guarda el resultado de la evaluación diagnóstica en PostgreSQL """
    
    # Validar que el usuario exista
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
    
@app.post("/api/cursos", status_code=status.HTTP_201_CREATED)
def crear_curso(curso: CursoCreate, db: Session = Depends(get_db)):
    """ Permite a RRHH registrar un nuevo curso en la base de datos """
    nuevo_curso = models.Curso(**curso.model_dump())
    db.add(nuevo_curso)
    db.commit()
    db.refresh(nuevo_curso)
    return {"status": "ok", "mensaje": "Curso creado exitosamente", "curso": nuevo_curso}


@app.get("/api/cursos")
def listar_cursos(puesto_id: str = None, db: Session = Depends(get_db)):
    """ Obtiene todos los cursos o los filtra por puesto """
    query = db.query(models.Curso)
    if puesto_id:
        query = query.filter(models.Curso.puesto_id == puesto_id)
    cursos = query.all()
    return {"status": "ok", "total": len(cursos), "cursos": cursos}


@app.delete("/api/cursos/{curso_id}")
def eliminar_curso(curso_id: int, db: Session = Depends(get_db)):
    """ Permite a RRHH eliminar un curso existente """
    curso = db.query(models.Curso).filter(models.Curso.id == curso_id).first()
    if not curso:
        raise HTTPException(status_code=404, detail="El curso no existe.")
    
    db.delete(curso)
    db.commit()
    return {"status": "ok", "mensaje": "Curso eliminado correctamente"}

@app.get("/api/rutas/usuario/{usuario_id}")
def obtener_ruta_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """ Obtiene la última ruta de aprendizaje guardada para un usuario """
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