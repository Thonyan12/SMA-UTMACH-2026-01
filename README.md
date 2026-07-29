<div align="center">
  <img src="Frontend/public/logo-horizontal-300x99.png" alt="Logo UTMACH" width="300" />
  
  # Sistema de Mentoría Académica (SMA)
  
  **Plataforma integral para conectar estudiantes y mentores académicos de la Universidad Técnica de Machala (UTMACH).**

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Oracle DB](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)](https://www.oracle.com/database/)
  [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

</div>

---

## Descripción del Proyecto

El **Sistema de Mentoría Académica (SMA)** es una solución de software moderna diseñada para democratizar y organizar el apoyo académico entre los estudiantes de la UTMACH. Permite que estudiantes destacados actúen como **Mentores** y ofrezcan sesiones de apoyo a sus compañeros en diversas materias. 

El sistema gestiona desde la postulación y aprobación de mentores, hasta la coordinación, ejecución interactiva y calificación de las sesiones de tutoría, apoyándose en la **gamificación** para incentivar el aprendizaje continuo.

---

## Características Principales

### 1. Seguridad y Autenticación Avanzada
- **Autenticación Institucional**: Acceso exclusivo para correos `@utmachala.edu.ec`.
- **Verificación en 2 Pasos (2FA)**: Código temporal enviado por correo electrónico para inicios de sesión en nuevos dispositivos o IP's diferentes.
- **Recuperación de Contraseña**: Enlace seguro por correo para reestablecer credenciales.
- **Control de Roles**: Un único usuario puede escalar dinámicamente de `Estudiante` a `Mentor` o ser `Administrador`.

### 2. Roles y Dashboards Dinámicos
El sistema adapta su interfaz según el rol del usuario conectado:
- **Estudiante**: Puede explorar el catálogo de mentores, solicitar sesiones, ver su calendario y calificar las mentorías recibidas.
- **Mentor**: Posee un panel adicional para gestionar solicitudes entrantes, configurar su disponibilidad, gestionar especialidades (materias que domina) y visualizar sus **Insignias y Logros**.
- **Administrador**: Panel de control maestro para gestionar usuarios, aprobar o rechazar postulaciones a mentores, revisar la agenda global, analizar auditorías y atender **Reportes de Incidencias**.

### 3. Flujo de Mentorías Completo
1. **Directorio**: Filtros por facultad, carrera y materia para encontrar al mentor ideal.
2. **Solicitud**: Petición de sesión indicando horario y tema.
3. **Aprobación**: El mentor acepta la solicitud en su dashboard.
4. **Sala Interactiva**: Acceso a un entorno en vivo.

### 4. Sala de Sesión Virtual (WebSockets)
- **Chat en Tiempo Real**: Comunicación instantánea cliente-servidor mediante WebSockets en FastAPI.
- **Gestión de Recursos**: Envío de enlaces y materiales directamente en la sesión.
- **Sistema de Reportes**: Si hay algún comportamiento inadecuado o problema técnico, cualquiera puede reportarlo y el equipo de Administración es notificado de inmediato.

### 5. Gamificación y Analíticas
- **Calificación 5 Estrellas**: Retroalimentación obligatoria al finalizar cada sesión.
- **Insignias Automáticas**: El sistema otorga logros automáticamente (Ej: *Tutor Principiante*, *Experto en Matemáticas*, *5 Sesiones Perfectas*) basados en el desempeño calificado del mentor.
- **Empty States**: Interfaces amigables cuando aún no hay datos o medallas alcanzadas.

### 6. Auditoría y Trazabilidad (Admin)
- **Gestión de Postulaciones**: Visualización de los motivos por los que un estudiante quiere ser mentor y la aprobación o rechazo con observaciones.
- **Historial de Sistema**: Registro (Trigger) en base de datos Oracle sobre quién, cuándo y qué acción se realizó en cualquier tabla sensible del sistema.

---

## Arquitectura y Tecnologías (Tech Stack)

### Frontend (Interfaz de Usuario)
Construido para ser increíblemente veloz, responsivo y visualmente atractivo.
- **React.js + Vite** para renderizado rápido.
- **React Router v6** para navegación anidada y protección de rutas.
- **Diseño Glassmorphism & UI Premium**: CSS Puro (sin frameworks invasivos), paletas de colores modernos, animaciones suaves (Framer Motion) e iconografía de `react-icons`.
- **Axios** para consumo de la API y manejo de Tokens JWT e interceptores.

### Backend (API y Lógica de Negocio)
- **FastAPI (Python)**: Framework moderno y de alto rendimiento.
- **SQLAlchemy ORM**: Mapeo relacional de objetos de base de datos.
- **WebSockets nativos**: Para el chat en vivo.
- **JWT (JSON Web Tokens)**: Para seguridad de API y manejo de sesiones stateless.
- **SMTP lib**: Para envíos de correos (2FA, reportes, recuperación).

### Base de Datos (Oracle DB)
- **Oracle Database 19c**.
- **PL/SQL Integrado**: Uso intensivo de *Triggers* y *Constraints* para validación a nivel de base de datos (Ej: Roles no duplicados, historial de auditoría automático, validación de tipos de notificaciones).

---

## Vistas y Analíticas

### El Ecosistema en Acción
1. **Landing Page Pública**: Diseño inmersivo con partículas animadas (`react-tsparticles`) y presentación de características, orientada a invitar a estudiantes a unirse.
2. **Dashboard Global**: Sistema de pestañas y cards analíticas.
3. **Flujo de Reportes**: Un módulo donde el Administrador recibe las banderas rojas (`Pendiente`), las investiga (`Revisado`) y toma acciones (`Resuelto`), con historial visible para el usuario.

---

## Instalación y Despliegue Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/thonyan12/Proyecto_SMA.git
cd Proyecto_SMA
```

### 2. Configurar la Base de Datos (Oracle)
1. Instalar Oracle DB XE.
2. Ejecutar el script maestro de base de datos para crear el esquema y datos iniciales:
```bash
sqlplus sys as sysdba @mentorias.sql
```

### 3. Ejecutar el Backend (FastAPI)
```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 4. Ejecutar el Frontend (React)
En una nueva terminal:
```bash
cd Frontend
npm install
npm run dev
```

---

## Creado por
Diseñado, planificado y desarrollado por **[Thonyan12](https://github.com/thonyan12)** para la Universidad Técnica de Machala.

> *"Reimaginando el apoyo académico con tecnología moderna."*
