from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

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
    rol: str = "empleado"  # Valor por defecto
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
                    "Trainee / Junior (0-1 años)",
                    "Mid-level (2-4 años)",
                    "Senior (5+ años)"
                ]
            },
            {
                "id": 2,
                "texto": "¿Cuál es tu nivel de dominio en la creación y arquitectura de servidores Backend?",
                "opciones": [
                    "Básico (Scripts simples o controladores básicos)",
                    "Intermedio (APIs REST con FastAPI, Express o Django)",
                    "Avanzado (Patrones de diseño, Microservicios y Async I/O)",
                    "Experto (Arquitecturas distribuidas, Event-Driven y Alta Disponibilidad)"
                ]
            },
            {
                "id": 3,
                "texto": "¿Qué tan familiarizado estás con la creación, consumo y seguridad de APIs REST?",
                "opciones": [
                    "Solo las he consumido desde el Frontend",
                    "He creado APIs básicas y rutas simples",
                    "Diseño arquitecturas REST estructuradas con autenticación (JWT/OAuth)",
                    "Manejo optimización, seguridad avanzada, rate limiting y documentación OpenAPI"
                ]
            },
            {
                "id": 4,
                "texto": "¿Cómo ha sido tu experiencia gestionando bases de datos en proyectos reales?",
                "opciones": [
                    "Poca interacción / Solo teoría",
                    "Consultas intermedias (CRUD y consultas simples)",
                    "Modelado de tablas, relaciones (3FN) y uso de ORMs (SQLAlchemy, Prisma)",
                    "Optimización de consultas complejas, indexación y migración de datos"
                ]
            },
            {
                "id": 5,
                "texto": "¿Cuál es tu flujo habitual para asegurar la calidad de tu código y entrega continua?",
                "opciones": [
                    "Uso básico de Git y revisiones manuales",
                    "Manejo fluido de Git (branches, PRs) y pruebas unitarias básicas",
                    "Escribo pruebas automatizadas (TDD) e integro pipelines de CI/CD",
                    "Diseño estrategias globales de arquitectura, testing y entrega continua"
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
                    "Redes Sociales y Creación de Contenido (Orgánico)",
                    "Publicidad Pagada (Meta Ads, Google Ads)",
                    "SEO y Posicionamiento en Buscadores",
                    "Estrategia Inbound, Email Marketing y Embudos completos"
                ]
            },
            {
                "id": 2,
                "texto": "¿Cómo interpretas las métricas de rendimiento en tus campañas?",
                "opciones": [
                    "Reviso métricas básicas (Likes, Alcance, Clics)",
                    "Configuro píxeles de seguimiento y mido conversiones (CPA, CTR)",
                    "Analizo el retorno de inversión completo (ROAS, CAC, LTV) en Google Analytics",
                    "Construyo dashboards automatizados (Looker Studio/Power BI) para decisiones estratégicas"
                ]
            },
            {
                "id": 3,
                "texto": "¿Qué nivel de experiencia tienes usando plataformas de CRM o automatización?",
                "opciones": [
                    "Ninguno / Solo listas de correo sencillas",
                    "Uso básico de CRM (Mailchimp, HubSpot) para envíos masivos",
                    "Creo secuencias de nutrición de leads y segmentaciones automáticas",
                    "Integro flujos complejos entre campañas, CRM y herramientas No-Code (Zapier/Make)"
                ]
            },
            {
                "id": 4,
                "texto": "¿Cómo abordas la mejora continua de tus contenidos o anuncios?",
                "opciones": [
                    "Cambio el texto o la imagen de manera intuitiva cuando no funciona",
                    "Realizo pruebas A/B sencillas en anuncios o páginas",
                    "Diseño experimentos basados en hipótesis y análisis del comportamiento del usuario",
                    "Optimizo embudos completos mediante CRO (Conversion Rate Optimization) y UX copywriting"
                ]
            },
            {
                "id": 5,
                "texto": "¿Cuál es tu experiencia administrando presupuestos de inversión publicitaria?",
                "opciones": [
                    "Sin experiencia en presupuestos de pauta",
                    "Presupuestos pequeños (menos de $500 USD/mes)",
                    "Presupuestos medianos y gestión directa de pauta escalar ($500 a $5,000 USD/mes)",
                    "Estrategias omnicanal con presupuestos elevados y optimización de capital"
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


@app.post("/api/rutas/generar-ia")
def generar_ruta_ia(data: GenerarRutaRequest):
    todos_los_cursos = CATALOGO_RRHH.get(data.puesto_id, [])
    
    if not todos_los_cursos:
        return {"status": "ok", "ruta": []}

    num_obligatorios = 3 if data.score < 70 else 2
    num_complementarios = 1

    cursos_obligatorios = [
        {**c, "obligatorio": True, "razon_ia": "Asignado por IA: Refuerzo prioritario por brecha en diagnóstico"}
        for c in todos_los_cursos[:num_obligatorios]
    ]

    cursos_complementarios = [
        {**c, "obligatorio": False, "razon_ia": "Sugerido por IA: Complementario para desarrollo profesional"}
        for c in todos_los_cursos[num_obligatorios:num_complementarios + num_obligatorios]
    ]

    ruta_final = cursos_obligatorios + cursos_complementarios

    return {
        "status": "ok",
        "puntuacion_diagnostico": data.score,
        "distribucion": {
            "porcentaje_obligatorios": "70%",
            "porcentaje_complementarios": "30%"
        },
        "ruta": ruta_final
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