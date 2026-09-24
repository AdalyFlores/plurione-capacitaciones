from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Boolean, JSON
from sqlalchemy.orm import relationship
from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    rol = Column(String, default="empleado")
    departamento = Column(String)
    puesto = Column(String)

    diagnosticos = relationship("Diagnostico", back_populates="usuario")
    rutas = relationship("RutaAprendizaje", back_populates="usuario")


class Pregunta(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True)
    puesto_id = Column(String, index=True, nullable=False) 
    texto = Column(String, nullable=False)
    opcion_1 = Column(String, nullable=False)
    opcion_2 = Column(String, nullable=False)
    opcion_3 = Column(String, nullable=False)
    opcion_4 = Column(String, nullable=False)


class Diagnostico(Base):
    __tablename__ = "diagnosticos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    puesto_evaluado = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="diagnosticos")

    
class Curso(Base):
    __tablename__ = "cursos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    duracion = Column(String, nullable=False)   
    nivel = Column(String, nullable=False)    
    categoria = Column(String, nullable=False) 
    puesto_id = Column(String, index=True, nullable=False) 
    url_contenido = Column(String, nullable=True) 

    
class RutaAprendizaje(Base):
    __tablename__ = "rutas_aprendizaje"

    id_ruta = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id"), nullable=False)  # Apunta a usuarios.id
    orden_secuencia_json = Column(JSON, nullable=False)
    fecha_asignacion = Column(Date, default=date.today)  # Corregido: date.today

    usuario = relationship("Usuario", back_populates="rutas")
    
    
class ProgresoCurso(Base):
    __tablename__ = "progreso_cursos"

    id_progreso = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    id_curso = Column(Integer, ForeignKey("cursos.id"), nullable=False)
    estatus = Column(String, default="Pendiente")  # 'Pendiente', 'En progreso', 'Completado'
    calificacion = Column(Float, nullable=True)

    # Relaciones
    usuario = relationship("Usuario")
    curso = relationship("Curso")