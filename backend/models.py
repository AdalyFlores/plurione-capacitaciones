from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Boolean, JSON, Text
from sqlalchemy.orm import relationship
from database import Base

# ==========================================
# ESTRUCTURA ORGANIZACIONAL (RRHH)
# ==========================================

class Departamento(Base):
    __tablename__ = "departamentos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    descripcion = Column(String(255), nullable=True)

    puestos = relationship("Puesto", back_populates="departamento")


class Puesto(Base):
    __tablename__ = "puestos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    departamento_id = Column(Integer, ForeignKey("departamentos.id"), nullable=False)

    departamento = relationship("Departamento", back_populates="puestos")
    #usuarios = relationship("Usuario", back_populates="puesto_rel")


# ==========================================
# USUARIOS Y AUTENTICACIÓN
# ==========================================

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    rol = Column(String(50), default="empleado") # 'empleado', 'rh', 'admin'
    departamento = Column(String(100), nullable=True) # Mantener para compatibilidad
    puesto = Column(String(100), nullable=True)       # Mantener para compatibilidad
    
    #puesto_id = Column(Integer, ForeignKey("puestos.id"), nullable=True)

    # Relaciones
    #puesto_rel = relationship("Puesto", back_populates="usuarios")
    diagnosticos = relationship("Diagnostico", back_populates="usuario")
    rutas = relationship("RutaAprendizaje", back_populates="usuario")
    progresos = relationship("ProgresoCurso", back_populates="usuario")


# ==========================================
# DIAGNÓSTICO E IA
# ==========================================

class Pregunta(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True)
    puesto_id = Column(String(50), index=True, nullable=False) 
    texto = Column(Text, nullable=False)
    opcion_1 = Column(String(255), nullable=False)
    opcion_2 = Column(String(255), nullable=False)
    opcion_3 = Column(String(255), nullable=False)
    opcion_4 = Column(String(255), nullable=False)


class Diagnostico(Base):
    __tablename__ = "diagnosticos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    puesto_evaluado = Column(String(100), nullable=False)
    score = Column(Float, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="diagnosticos")


class RutaAprendizaje(Base):
    __tablename__ = "rutas_aprendizaje"

    id_ruta = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    orden_secuencia_json = Column(JSON, nullable=False)
    fecha_asignacion = Column(Date, default=date.today)

    usuario = relationship("Usuario", back_populates="rutas")


# ==========================================
# CURSOS, REPRODUCTOR Y SEGUIMIENTO xAPI
# ==========================================

class Curso(Base):
    __tablename__ = "cursos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    duracion = Column(String(50), nullable=False)    # Ej: "45 min" o "2 horas"
    nivel = Column(String(50), nullable=False)       # 'Básico', 'Intermedio', 'Avanzado'
    categoria = Column(String(100), nullable=False) 
    puesto_id = Column(String(50), index=True, nullable=False) 
    url_contenido = Column(String(500), nullable=True) # Enlace al video/recurso
    tipo_contenido = Column(String(50), default="VIDEO") # 'VIDEO', 'DOCUMENTO', 'SCORM'


class ProgresoCurso(Base):
    __tablename__ = "progreso_cursos"

    id_progreso = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    id_curso = Column(Integer, ForeignKey("cursos.id"), nullable=False)
    estatus = Column(String(50), default="Pendiente")  # 'Pendiente', 'En progreso', 'Completado'
    calificacion = Column(Float, nullable=True)
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_completado = Column(DateTime, nullable=True)

    usuario = relationship("Usuario", back_populates="progresos")
    curso = relationship("Curso")


class XAPIStatement(Base):
    """
    Tabla para almacenar eventos oficiales de xAPI (Learning Record Store simplificado)
    """
    __tablename__ = "xapi_statements"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    verb = Column(String(100), nullable=False)  # ej: 'initialized', 'completed', 'passed'
    object_id = Column(String(255), nullable=False) # URI o ID del curso/recurso
    statement_json = Column(JSON, nullable=False)  # Enunciado xAPI completo
    timestamp = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario")