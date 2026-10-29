# Reglas y Estándares del Proyecto (GEMINI.md)

### 1. Eficiencia y Ejecución
- **Enfoque directo**: No busques archivos adicionales ni verifiques herramientas salvo que se te pida explícitamente[cite: 2].
- **Alcance acotado**: Aplica únicamente el cambio solicitado en el archivo objetivo y termina sin explicaciones redundantes[cite: 2].
- **Optimización de contexto**: Minimiza el consumo de tokens y llamadas innecesarias al contexto[cite: 2].

### 2. Memoria de IA y Continuidad del Proyecto (Flujo de Trabajo)
Para garantizar que la IA recuerde el contexto entre múltiples sesiones y chats nuevos, nos basamos en un sistema estricto de tres archivos de texto alojados en una carpeta llamada .agents en la raiz del proyecto [cite: 1]:
- **El Manual (`AGENTS.md`)**: Este documento. Describe la arquitectura, identidad visual y reglas del proyecto[cite: 1, 2].
- **El Estado (`STATUS.md`)**: Contiene la "foto de hoy". Describe en qué estamos trabajando en este momento exacto y cuáles son los pasos inmediatos a seguir[cite: 1].
- **El Historial (`CHANGELOG.md`)**: Un registro acumulativo de todo lo que hemos ido haciendo y las decisiones o motivos detrás de cada cambio[cite: 1].

**Regla Operativa Obligatoria:**
1. **Al iniciar:** La IA debe leer siempre `GEMINI.md`, `STATUS.md` y `CHANGELOG.md` para saber exactamente dónde quedamos[cite: 1].
2. **Al terminar:** Antes de concluir una tarea o sesión, la IA debe actualizar `STATUS.md` y `CHANGELOG.md` anotando qué se resolvió y qué falta por hacer[cite: 1].
3. **Colaboración:** Todos estos archivos se mantendrán sincronizados mediante un repositorio Git, permitiendo que cualquier miembro del equipo continúe el trabajo con cualquier IA sin perder el contexto[cite: 1].

### 3. Stack Visual, Identidad y Sistema de Diseño (The Formulab Brand DNA)

- **Framework & Componentes**: Utiliza exclusivamente Tailwind CSS y componentes de shadcn/ui ubicados en `@/components/ui/`[cite: 2].
- **Iconografía**: Usa únicamente `lucide-react`. Prohibido importar librerías de iconos adicionales[cite: 2].
- **Sin estilos inline**: Prohibido el uso de `style={{ ... }}` o crear nuevos archivos `.css`. Toda la maquetación se resuelve con clases utilitarias de Tailwind[cite: 2].

#### Directriz de Identidad Visual ("Clinical High-Tech Lab"):
Toda nueva vista, página o componente debe alinearse con la identidad consolidada en `ProposalView.jsx` y `PublicCalendarPage.jsx`[cite: 2]:

1. **Paleta y Fondos**:
   - **Fondo Base**: Superficie neutra de laboratorio (`bg-[#f4f4f4]` o `bg-gray-50`), nunca blancos planos sin textura ni fondos oscuros desconectados en las vistas públicas principales[cite: 2].
   - **Efecto Ambiental**: Gradiente radial sutil en esquina superior (`bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ef18d6]/10 via-transparent to-transparent pointer-events-none`)[cite: 2].
   - **Tarjetas y Superficies**: Blanco puro (`bg-white` o `bg-white/80 backdrop-blur-lg`) con bordes quirúrgicos (`border-gray-100` o `border-gray-200`) y sombras suaves (`shadow-sm`, `shadow-md` o `shadow-xl`)[cite: 2].
   - **Acentos de Marca**:
     - *Brand Magenta*: `#ef18d6` (`text-brand-magenta`, `bg-brand-magenta`, o `selection:bg-[#ef18d6]/20 selection:text-[#ef18d6]`)[cite: 2].
     - *Brand Electric Blue*: `#188ff0` (`text-brand-blue`, `bg-brand-blue`, badges `bg-blue-50 border-blue-100 text-brand-blue`)[cite: 2].
     - *Gradiente Lab*: `linear-gradient(135deg, #ef18d6 0%, #188ff0 100%)` (`text-gradient`)[cite: 2].
   - **Contraste de Textos**: Títulos en `text-gray-900` (`font-sora font-bold tracking-tight`), descripciones en `text-gray-500` o `text-gray-600` (`font-inter`)[cite: 2].

2. **Tipografía Oficial**:
   - **Display / Títulos / CTAs / Métricas**: `font-sora` (`Sora, sans-serif`)[cite: 2].
   - **Lectura / UI / Formularios**: `font-inter` (`Inter, sans-serif`)[cite: 2].
   - **Técnico / Fechas / Badges de Laboratorio**: `font-mono` (`JetBrains Mono, monospace` con `.lab-mono`)[cite: 2].

3. **Geometría y Componentes Característicos**:
   - **Pill Shape Dominante**: Badges, botones de acción y switches segmentados usan `rounded-full`[cite: 2].
   - **Controles Segmentados (View Switchers)**: Contenedor `bg-gray-100 p-1 rounded-full border border-gray-200` con pestaña activa en `bg-gray-900 text-white shadow-md rounded-full` e inactivas en `text-gray-600 hover:text-gray-900`[cite: 2].
   - **Botones de Acción (CTAs)**: `h-11 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98]`[cite: 2].
   - **Elemento Insignia**: En secciones interactivas, diagnósticos o formularios, preservar e integrar el **Tubo de Ensayo interactivo** (`TestTube.jsx` con animaciones de fluidos y burbujas reactivas)[cite: 2].
   - **Estandarización de Modales con Pestañas / Formularios Extensos (Alto Estático 95vh)**:
     - En modales de captura, edición y configuración con múltiples pestañas o formularios divididos, queda estrictamente prohibida la altura variable o el redimensionamiento dinámico entre pestañas (*content jumping*)[cite: 2].
     - El diálogo debe construirse obligatoriamente sobre `BaseFormModal` y fijarse a una altura casi completa del viewport: `className="h-[95vh] max-h-[95vh]"`, con cabecera oscura (`bg-slate-950`) fija superior, pestañas superiores ancladas mediante `tabs={...}` sin emojis (utilizando exclusivamente iconos de `lucide-react`), pie de botones fijo inferior y área de contenido con scroll vertical interno exclusivo (`bodyClassName="max-h-none flex-1 overflow-y-auto min-h-0"`)[cite: 2].

4. **Mobile-First & Experiencia Nativa Social (Instagram/TikTok UX Pattern)**:
   - **Filosofía de App Nativa**: En pantallas móviles (`< 768px`), la interfaz no debe comportarse como una "página web adaptada", sino emular los patrones de interacción y ergonomía de una app móvil de Instagram[cite: 2].
     - **Visores y Lightboxes (Mockup Móvil)**: Los modales de detalle de publicación deben ocupar la proporción vertical completa o viewport móvil (`h-[100dvh]` o tarjeta centrada `max-w-md w-full aspect-[9/16]`), con esquinas curvadas de dispositivo (`rounded-[28px]`), fondo negro/oscuro inmersivo y botón de cierre `X` translúcido flotante superior[cite: 2].
     - **Cajones Deslizables (Bottom Sheets con Handle)**: Toda la información contextual debe presentarse mediante un *bottom sheet* anclado abajo con un pill handle táctil superior centrado, con dos estados fluidos: *Colapsado* y *Expandido* (máximo `max-h-[50vh]`)[cite: 2].
     - **Navegación Táctil (Gestos & Thumb Zone)**:
       - Los botones de acción primaria deben colocarse en la zona cómoda del pulgar con alturas táctiles mínimas de 44–48px (`py-3`) y estado de pulsación (`active:scale-[0.98] transition-transform`)[cite: 2].
       - Navegación entre publicaciones consecutivas mediante toques a los costados o botones flotantes amplios accesibles con una sola mano[cite: 2].
   - **Rigor de Maquetación y Carga**:
     - Cero scroll horizontal accidental en la raíz (`overflow-x-hidden w-full`)[cite: 2].
     - Respeta las áreas seguras de notch y barra de navegación inferior móvil (`pb-safe` o `pb-24` en layouts principales)[cite: 2].
     - Estados de carga exclusivamente mediante esqueletos oscuros o neutros (`Skeleton` de shadcn con transiciones de pulso suaves)[cite: 2].

### 4. Arquitectura y Estructura Exhaustiva de Carpetas
Respeta y mantén con estricta rigurosidad la delimitación de responsabilidades en cada directorio del proyecto[cite: 2]:

#### A. Backend & Serverless (`api/` en raíz)
- **Regla estricta**: Es el **único lugar** donde pueden residir credenciales privilegiadas (`SUPABASE_SERVICE_ROLE_KEY`, `R2_SECRET_ACCESS_KEY`, S3 Clients). Nunca importar código de React ni utilidades del frontend aquí[cite: 2].

#### B. Capa de Rutas y Páginas (`src/pages/`)
- **Regla estricta**: No incluir maquetaciones monolíticas de más de 200 líneas; delega las secciones visuales a `src/components/`[cite: 2].

#### C. Capa de Componentes (`src/components/`)
- `src/components/ui/`: Primitivas atómicas del design system. **Regla estricta**: Cero lógica de negocio, cero llamadas a Supabase o APIs[cite: 2].
- Directorios específicos por dominio (`dashboard/`, `calendar/`, `proposal/`, `landing/`, `auth/`, `common/`)[cite: 2].

#### D. Datos Estáticos y Contratos (`src/data/`)
- **Regla estricta**: Archivos puramente declarativos (objetos y constantes exportadas). Prohibido incluir estado React o llamadas asíncronas de red[cite: 2].

#### E. Librerías y Clientes Core (`src/lib/`)
- **Regla estricta**: Solo configuraciones base. No colocar lógica de negocio ni peticiones puntuales aquí[cite: 2].

#### F. Servicios y Comunicación Externa (`src/services/`)
- **Regla estricta**: Cero JSX, cero imports de React. Deben ser funciones asíncronas puras que retornen `{ success, data, error }`[cite: 2].

#### G. Hooks Personalizados (`src/hooks/`)
- **Regla estricta**: Todo hook debe comenzar con `use` y encapsular lógica reactiva pura sin renderizar JSX directamente[cite: 2].

#### H. Contextos Globales (`src/context/`)
- **Regla estricta**: Limitar el estado global a datos de sesión y colas de subida transversales. No almacenar estado local de páginas o formularios[cite: 2].

#### I. Utilidades y Helpers Puros (`src/utils/`)
- **Regla estricta**: Funciones deterministas y reutilizables. Prohibido usar hooks de React aquí[cite: 2].

### 5. Modularización, Escalabilidad y Reutilización de Código (DRY)
- **Reutilización obligatoria**: Antes de escribir un nuevo componente, revisa y reutiliza los existentes en `src/components/ui/` y secciones compartidas (`src/components/common/`). Todo modal de captura/edición debe construirse sobre `BaseFormModal.jsx`[cite: 2].
- **Principio de Responsabilidad Única (SRP)**:
  - Si un componente excede las 200–250 líneas de código, subdivídelo en subcomponentes atómicos[cite: 2].
  - Separa la lógica de obtención y mutación de datos de la capa puramente presentacional[cite: 2].
- **Componentes desacoplados**: Diseña componentes independientes recibiendo datos mediante props tipadas/documentadas[cite: 2].
- **Evitar duplicación de utilidades**: Si una función se usa en más de un lugar, colócala en `src/utils/`[cite: 2].

### 6. Seguridad en APIs Serverless y Control de Acceso (Zero Trust)
- **Autenticación obligatoria en endpoints de mutación (`api/*`)**: Ningún endpoint puede ejecutar operaciones sin validar primero la sesión del usuario mediante el token JWT de Supabase[cite: 2].
- **Prohibición de borrado arbitrario en Cloudflare R2**: Queda estrictamente prohibido aceptar solicitudes de borrado o generación de URLs destructivas sin autenticación verificada[cite: 2].
- **Uso restringido de `SUPABASE_SERVICE_ROLE_KEY`**: Jamás uses `service_role` para omitir políticas de seguridad en endpoints públicos sin autenticar al llamante[cite: 2].
- **Cero validación de seguridad delegada al cliente (CWE-602)**: Jamás envíes datos sensibles al navegador bajo la premisa de "ocultarlos con CSS o un `if` en React"[cite: 2].
- **Políticas Row Level Security (RLS) estrictas en Supabase**: Toda tabla debe tener RLS habilitado. Quedan terminantemente prohibidas las políticas `anon` permisivas del tipo `USING (true)`[cite: 2].

### 7. Aislamiento de Entorno y Secretos (Cero Filtraciones)
- **Prohibición estricta de valores quemados (hardcoded secrets)**: Jamás escribas credenciales directamente en el código fuente ni en commits[cite: 2].
- **Prohibidos los fallbacks literales**: Vetado el patrón `process.env.VAR || "clave_real"`. Si una variable falta, lanza un error explícito[cite: 2].
- **Sanitización total de `.env.example`**: Debe contener únicamente nombres de variables y plantillas vacías[cite: 2].
- **Aislamiento del bundle en Vite (`vite.config.js`)**: Únicamente las variables que comienzan con `VITE_` pueden exponerse al frontend. Toda credencial de backend debe permanecer en Node.js (`api/`)[cite: 2].

### 8. Infraestructura y Cabeceras de Seguridad Edge (`vercel.json`)
- Toda configuración de despliegue en `vercel.json` debe incluir obligatoriamente encabezados de seguridad HTTP estándar (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Strict-Transport-Security`) y políticas de CORS explícitas[cite: 2].

### 9. Rendimiento, Agilidad y Buenas Prácticas
- **Prevención de re-renders innecesarios**: Utiliza `useMemo` y `useCallback` en cálculos derivados pesados y evita crear objetos o funciones anónimas inline dentro de `.map(...)`[cite: 2].
- **Optimización en la carga de medios (Media Performance)**: En vistas de cuadrícula o listado, nunca renderices elementos `<video>` reales completos: utiliza siempre la miniatura estática (`thumbnail_url` / `poster`). Todo elemento multimedia debe implementar carga diferida[cite: 2].
- **Limpieza de efectos asíncronos y eventos**: Todo `useEffect` que añada un listener global debe retornar obligatoriamente su función de limpieza[cite: 2].
- **Agilidad y Cero Bloqueo del Event Loop**: Toda operación intensiva debe ejecutarse de forma asíncrona, en segundo plano o dividida en microtareas[cite: 2].
- **Tree-Shaking e Importaciones Limpias**: Importa selectivamente desde librerías utilitarias[cite: 2].

### 10. Consistencia de Datos, Ciclo de Vida e Integridad (Data Consistency & Sync)
#### A. Integridad Referencial y Contratos en Base de Datos
- **Eliminación y Limpieza en Cascada Obligatoria (`ON DELETE CASCADE`)**: Toda relación padre-hijo debe tener explícitamente configurada esta cláusula. Prohibición de Registros Huérfanos[cite: 2].
- **Sincronización Estricta entre Contratos de BD y Frontend**: Cualquier nuevo estado introducido por la lógica de negocio debe migrarse primero en la base de datos[cite: 2].
- **Transacciones y Operaciones Atómicas**: Toda mutación que involucre más de un paso debe encapsularse en una función RPC / transacción en base de datos[cite: 2].

#### B. Gestión de Estado, Caché e Invalidación en Frontend
- **Invalidación Proactiva de Caché**: Toda mutación exitosa debe desencadenar inmediatamente la invalidación y refetch de las colecciones afectadas[cite: 2].
- **Prevención de Estado Obsoleto**: Al cerrar modales de edición/creación o cambiar de vista, purga o sincroniza los estados locales vinculados al registro modificado[cite: 2].

#### C. Sincronización Reactiva y Eventos Externos
- **Sincronización en Tiempo Real para Acciones de Clientes**: Para eventos externos, el dashboard debe escuchar los cambios mediante canales en tiempo real o implementar una verificación periódica (polling) al enfocar la pestaña[cite: 2].
- **Estados de Transición Idempotentes**: Toda llamada de cambio de estado en la API o servicios debe ser idempotente[cite: 2].