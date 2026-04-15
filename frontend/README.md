# ProyectoClinica — Frontend

Aplicación web para la gestión de una clínica médica. Permite administrar especialidades, médicos, pacientes, turnos, consultas, historias clínicas y recetas, con control de acceso basado en roles.

---

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.2 | Biblioteca de UI |
| TypeScript | 5.9 | Tipado estático |
| React Router DOM | 7.13 | Enrutamiento del lado del cliente |
| Tailwind CSS | 4.2 | Estilos utilitarios |
| Vite | 7.3 | Bundler y servidor de desarrollo |

---

## Instalación y ejecución

### Requisitos

- Node.js 18+
- Backend corriendo (ver `../Server/`)

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto frontend:

```env
VITE_API_URL=http://localhost:5000
```

### Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint
```

---

## Estructura de carpetas

```
frontend/
├── public/
└── src/
    ├── App.tsx                      # Definición de rutas
    ├── main.tsx                     # Entry point
    ├── constants.ts                 # Endpoints y constantes globales
    ├── assets/
    ├── components/
    │   ├── consultas/               # Consultas médicas + estudios médicos
    │   ├── especialidades/          # Gestión de especialidades
    │   ├── historias-clinicas/      # Historias clínicas + antecedentes
    │   ├── inicio/                  # Dashboard principal
    │   ├── login/                   # Inicio de sesión
    │   ├── medicos/                 # Gestión de médicos
    │   ├── navBar/                  # Barra de navegación
    │   ├── pacientes/               # Gestión de pacientes
    │   ├── popup/                   # Modal de confirmación/error
    │   ├── recetas/                 # Recetas médicas + medicamentos
    │   ├── registro/                # Registro de usuarios
    │   ├── routes/                  # Guards de rutas
    │   └── turnos/                  # Gestión de turnos
    └── utils/
        ├── authFetch.ts             # Fetch autenticado con JWT
        ├── isTokenValid.ts          # Validación de token y extracción de rol
        ├── parseApiError.ts         # Parseo de errores de la API
        └── types.ts                 # Tipos compartidos de utilidades
```

---

## Rutas

| Ruta | Componente | Guard | Acceso |
|---|---|---|---|
| `/login` | Login | PublicRoute | Usuarios no autenticados |
| `/registro` | Registro | PublicRoute | Usuarios no autenticados |
| `/inicio` | Inicio | PrivateRoute | Todos los roles autenticados |
| `/especialidades` | Especialidades | AdminRoute | Administrador, Recepcionista |
| `/medicos` | Medicos | AdminRoute | Administrador, Recepcionista |
| `/pacientes` | Pacientes | AdminRoute | Administrador, Recepcionista |
| `/turnos` | Turnos | PrivateRoute | Todos los roles (vista filtrada por rol) |
| `/consultas` | Consultas | PrivateRoute | Todos los roles (vista filtrada por rol) |
| `/historias-clinicas` | HistoriasClinicas | PrivateRoute | Todos los roles (vista filtrada por rol) |
| `/recetas` | Recetas | PrivateRoute | Todos los roles (vista filtrada por rol) |
| `*` | — | — | Redirige a `/login` |

### Guards de rutas

| Guard | Comportamiento |
|---|---|
| `PrivateRoute` | Redirige a `/login` si no hay token válido |
| `PublicRoute` | Redirige a `/inicio` si ya está autenticado |
| `AdminRoute` | Requiere token válido **y** rol `Administrador` o `Recepcionista`. Redirige a `/inicio` si el rol no es suficiente |
| `MedicoRoute` | Requiere rol `Administrador` o `Medico` |

---

## Roles y permisos

| Rol | Permisos |
|---|---|
| **Administrador** | Acceso total a todos los módulos |
| **Recepcionista** | Especialidades, Médicos, Pacientes, Turnos |
| **Medico** | Turnos, Consultas, Historias Clínicas, Recetas (CRUD) |
| **Paciente** | Vista de sus propios turnos, consultas, historia clínica y recetas (solo lectura) |

---

## Autenticación

El sistema usa **JWT Bearer tokens** almacenados en `localStorage`.

### Flujo

1. El usuario inicia sesión en `/login` → el backend devuelve un JWT.
2. El token se guarda en `localStorage.token`.
3. Todas las llamadas a la API usan `authFetch`, que agrega el header `Authorization: Bearer {token}` automáticamente.
4. Si el backend responde `401`, el token se elimina y se redirige a `/login`.
5. `isTokenValid()` verifica la expiración del token (claim `exp`) antes de cada ruta protegida.

### Utilidades del token

```ts
isTokenValid()   // Verifica que el token no esté expirado
getUsername()    // Extrae el claim UserName
getEmail()       // Extrae el claim Email
getUserRole()    // Extrae el rol del claim de Microsoft Identity
canManage()      // true si el rol es Administrador o Recepcionista
```

---

## Llamadas a la API

Todas las peticiones HTTP pasan por `authFetch`:

```ts
const res = await authFetch({
  endpoint: ENDPOINTS.CONSULTA,   // string — ruta relativa
  method: METHODS.GET,            // 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body: JSON.stringify(payload),  // opcional, para POST/PUT
});
```

La URL base se obtiene de la variable de entorno `VITE_API_URL`.

### Endpoints disponibles

| Constante | Ruta |
|---|---|
| `ENDPOINTS.LOGIN` | `/api/Usuario/Login` |
| `ENDPOINTS.REGISTRO` | `/api/Usuario/Registrar` |
| `ENDPOINTS.ESPECIALIDAD` | `/api/Especialidad` |
| `ENDPOINTS.MEDICO` | `/api/Medico` |
| `ENDPOINTS.PACIENTE` | `/api/Paciente` |
| `ENDPOINTS.TURNO` | `/api/Turno` |
| `ENDPOINTS.CONSULTA` | `/api/Consulta` |
| `ENDPOINTS.HISTORIA_CLINICA` | `/api/HistoriaClinica` |
| `ENDPOINTS.ANTECEDENTE_MEDICO` | `/api/AntecedenteMedico` |
| `ENDPOINTS.ESTUDIO_MEDICO` | `/api/EstudioMedico` |
| `ENDPOINTS.RECETA` | `/api/Receta` |
| `ENDPOINTS.DETALLE_RECETA` | `/api/DetalleReceta` |

---

## Componentes

### Inicio

Dashboard principal. Muestra accesos rápidos según el rol del usuario autenticado.

---

### Especialidades

Gestión CRUD de especialidades médicas. Solo accesible para Administrador y Recepcionista.

**Modelo:**
```ts
interface Specialty {
  id: number;
  nombre: string;
  descripcion: string;
}
```

---

### Medicos

Gestión CRUD de médicos. Solo accesible para Administrador y Recepcionista.

**Modelo:**
```ts
interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  matricula: string;
  especialidadId: number;
  especialidad: string;
  telefono: string;
  email: string;
  activo: boolean;
}
```

---

### Pacientes

Gestión CRUD de pacientes. Solo accesible para Administrador y Recepcionista.

**Modelo:**
```ts
interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  fechaNacimiento: string;
  sexo: string;           // 'Masculino' | 'Femenino'
  telefono: string;
  email: string;
  direccion: string;
  grupoSanguineo: string; // 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  fechaAlta: string;
  activo: boolean;
}
```

---

### Turnos

Gestión de turnos médicos. La vista se filtra según el rol:

- **Paciente:** solo ve sus propios turnos.
- **Medico:** ve los turnos asignados a él.
- **Admin/Recepcionista:** ve todos los turnos y puede crear/editar/cancelar.

Estados posibles: `Pendiente`, `Confirmado`, `Cancelado`, `Completado`.

**Modelo:**
```ts
interface Turno {
  id: number;
  medicoId: number;
  medico: string;
  pacienteId: number;
  paciente: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  observaciones: string;
  fechaCreacion: string;
  fechaCancelacion: string | null;
}
```

---

### Consultas

Registro de consultas médicas con estudios médicos asociados (gestión inline dentro de cada consulta).

Los médicos tienen tres vistas disponibles: **Calendario**, **Turnos del día** y **Lista de consultas**.

Los pacientes solo ven sus propias consultas (filtradas por historia clínica).

**Modelos:**
```ts
interface Consulta {
  id: number;
  fechaConsulta: string;
  motivoConsulta: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  fechaRegistro: string;
}

interface EstudioMedico {
  id: number;
  consultaId: number;
  tipoEstudio: string;
  resultado: string;
  archivoAdjuntoURL: string;
  fechaEstudio: string;
}
```

---

### Historias Clínicas

Historial clínico por paciente. Muestra antecedentes médicos y el listado de consultas asociadas.

Los pacientes solo ven su propia historia clínica.

**Modelos:**
```ts
interface HistoriaClinica {
  id: number;
  paciente: string;
  fechaCreacion: string;
  observacionesGenerales: string;
  antecedentesMedicos: AntecedenteMedico[];
  consultas: Consulta[];
}

interface AntecedenteMedico {
  id: number;
  tipo: string;
  descripcion: string;
  fechaRegistro: string;
}
```

---

### Recetas

Gestión de recetas médicas. Cada receta está asociada a una consulta y puede contener múltiples medicamentos (detalles), gestionados de forma inline dentro de cada receta.

Los pacientes solo ven sus recetas en modo lectura. Médicos y administradores tienen CRUD completo.

**Modelos:**
```ts
interface Receta {
  id: number;
  consultaId: number;
  fechaEmision: string;
  indicacionesGenerales: string;
  detalles: DetalleReceta[];
}

interface DetalleReceta {
  id: number;
  recetaId: number;
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
}
```

---

### Popup

Componente modal reutilizable para confirmaciones y notificaciones de error/éxito.

```ts
<Popup
  title="Eliminar registro"
  message="¿Estás seguro?"
  confirmText="Eliminar"
  cancelText="Cancelar"
  variant="danger"        // 'danger' | 'info' | 'success'
  showCancel={true}
  onConfirm={handleDelete}
  onCancel={() => setDeleteId(null)}
/>
```

---

### NavBar

Barra de navegación superior. Muestra el nombre de usuario, su rol y el botón de cerrar sesión. Al hacer logout se elimina el token de `localStorage` y se redirige a `/login`.

---

## Manejo de errores

Los errores de la API se parsean con `parseApiError(res: Response)`:

- Si la respuesta incluye `errors` (validaciones de ASP.NET), los concatena en un único mensaje.
- Si incluye `title` o `message`, los usa directamente.
- En caso de fallo inesperado, devuelve el mensaje genérico `GENERIC_ERROR`.

Los errores siempre se muestran a través del componente `Popup` con `variant="danger"`.
