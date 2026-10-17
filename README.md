# 🧪 The Formulabs — Clinical High-Tech Lab Platform

> **The Formulabs** es una plataforma integral de alto rendimiento diseñada para agencias de marketing y creadores de contenido. Fusiona un embudo de diagnóstico clínico interactivo, un motor de cotización y versionado de propuestas comerciales, un gestor operativo de rodajes con SLA estricto y un calendario editorial multicanal con experiencia nativa para redes sociales.

---

## 📌 Tabla de Contenidos

- [Arquitectura General](#-arquitectura-general)
- [Módulos Principales](#-módulos-principales)
  - [1. Diagnóstico Interactivo & Embudo de Leads](#1-diagnóstico-interactivo--embudo-de-leads)
  - [2. Propuestas Comerciales & Versionado Iterativo](#2-propuestas-comerciales--versionado-iterativo)
  - [3. Gestión de Clientes & Calendarios Editoriales](#3-gestión-de-clientes--calendarios-editoriales)
  - [4. Operaciones, Rodajes & Protocolo SLA](#4-operaciones-rodajes--protocolo-sla)
  - [5. Galería Multimedia & Almacenamiento Híbrido](#5-galería-multimedia--almacenamiento-híbrido)
  - [6. Configuración de Agencia & Pasarela de Pagos](#6-configuración-de-agencia--pasarela-de-pagos)
- [Sistema de Diseño: Clinical High-Tech Lab](#-sistema-de-diseño-clinical-high-tech-lab)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Stack Tecnológico](#-stack-tecnológico)
- [Variables de Entorno](#-variables-de-entorno)
- [Instalación y Comandos](#-instalación-y-comandos)
- [Seguridad & Despliegue en Producción](#-seguridad--despliegue-en-producción)

---

## 🏗️ Arquitectura General

La plataforma está diseñada con una arquitectura desacoplada, segura y serverless bajo el principio **Zero-Trust**:

```
                              ┌──────────────────────────────────┐
                              │  Cliente / Usuario (Navegador)   │
                              └────────────────┬─────────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       │                                               │
             [Frontend SPA]                                [Serverless Edge API]
          Vite + React 18 + UI                        Node.js (Vercel Functions - api/)
                       │                                               │
         ┌─────────────┴─────────────┐                 ┌───────────────┴───────────────┐
         │                           │                 │                               │
  [Supabase Public]          [Cloudflare R2]   [Supabase Service Role]             [Resend API]
 PostgreSQL + Realtime       URLs Prefirmadas    Mutaciones Seguras            Alertas por Email
  (RLS Restrictivo)           Videos Pesados      y Desbloqueo de Pagos         Transaccionales
```

- **Frontend SPA**: Construido con Vite y React 18, estilizado exclusivamente con Tailwind CSS y componentes atómicos de Radix UI/shadcn.
- **Backend Edge / Serverless (`api/`)**: Handlers en Node.js alojados en Vercel para operaciones privilegiadas, emisión de firmas de subida a Cloudflare R2 y despacho de emails vía Resend.
- **Base de Datos**: PostgreSQL en Supabase con Row Level Security (RLS) riguroso, transacciones atómicas (RPC) e integridad referencial (`ON DELETE CASCADE`).
- **Almacenamiento Híbrido**: Cloudflare R2 para streaming y entrega de video pesado en alta resolución con URLs prefirmadas; Supabase Storage para miniaturas e imágenes optimizadas del calendario.

---

## 🚀 Módulos Principales

### 1. Diagnóstico Interactivo & Embudo de Leads
- **Ruta Pública**: `/diagnostico` (o `/formulario`).
- **Embudo de 12 Pasos Clínico**: Formulario guiado que diagnostica la salud del embudo de marketing del prospecto, integrando el tubo de ensayo interactivo animado (`TestTube.jsx`) con reactividad de fluidos y burbujas.
- **Calificación Automatizada de Ruta**: Determina en tiempo real el tratamiento óptimo para la marca:
  - *Gestión Integral* (Ruta A)
  - *Proyecto Puntual* (Ruta B)
  - *Sitio Web de Conversión* (Ruta Web)
  - *Mentoría Directa* (Ruta Mentoría)
- **Expediente Clínico & Leads en Dashboard**:
  - Actualización en tiempo real vía **Supabase Realtime** sin recargar la página.
  - Alerta transaccional inmediata por email mediante **Resend**.
  - Acciones rápidas de alta conversión: enlace directo a WhatsApp, Instagram y botón en 1 clic para **Generar Propuesta** o **Convertir en Cliente Activo**.

### 2. Propuestas Comerciales & Versionado Iterativo
- **Ruta Pública**: `/:slug` o `/propuesta/:slug`.
- **Cotizador Dinámico Multidimensional**: Cálculo instantáneo por paquetes de servicio (*Esencial*, *Crecimiento*, *Escala*) y adicionales configurables (*Meta Ads*, *Manejo de Redes*, *Sesiones de Rodaje Extra*).
- **Árbol de Versionado Clínico**: Creación de revisiones iteradas (`v1`, `v2`, `v3...`) vinculadas al expediente raíz. Incluye borrado inteligente de versiones para prevenir registros huérfanos y apertura automática del editor tras clonar.
- **Vista Interactiva de Propuesta**: Interfaz pública de alta conversión con calculadora de ROI, desglose de entregables, casos de estudio y activación inmediata.
- **Modal de Activación y Desglose de Abonos (`ProposalActivationModal`)**:
  - Visualización transparente de la inversión total.
  - Esquema quincenal claro: **1er Abono Inmediato** (50% prioritario) y **2do Abono Programado**.
  - Datos bancarios oficiales sincronizados desde la base de datos con copiado de CLABE en 1 toque.
  - Enlace directo a WhatsApp con mensaje precargado que incluye el slug del cliente y los montos exactos a liquidar.

### 3. Gestión de Clientes & Calendarios Editoriales
- **Ruta Pública**: `/:clientSlug/:calendarSlug` (ej. `/yamamoto/octubre-2026`).
- **Directorio Centralizado de Clientes**: Búsqueda instantánea, gestión de locación base para rodajes y borrado seguro con confirmación clínica (`ConfirmDeleteModal`).
- **Generador de "Cajas Vacías"**: Creación automatizada de borradores mensuales distribuidos de Reels y Carruseles.
- **Importador Inteligente desde Word (`.docx`)**:
  - Procesamiento 100% en cliente con `mammoth.js` y regex estructurado.
  - Identificación automática de fechas, horas, formatos (`Reel`/`Carrusel`) y separación de copywriting (`Caption` y `CTA`).
  - Previsualización y auto-rellenado de cajas vacías existentes.
- **Experiencia Móvil Social-First**:
  - Modales en proporción vertical inspirados en Instagram (`InstagramPostPreviewModal`, `MediaDetailModal`).
  - Bottom sheets deslizables con pill handle táctil para leer el copy completo sin scroll horizontal.
  - Botones de acción ergonómicos en la zona del pulgar: **Copiar Copywriting** y **Descargar Activo**.
  - Descarga masiva de activos del mes empaquetados en `.zip`.

### 4. Operaciones, Rodajes & Protocolo SLA
- **Ruta Pública de Reserva**: `/reservar/produccion?token=<token>`.
- **Ciclos Mensuales y Asignación de Rodajes**: Generación automática de slots de producción según las sesiones mensuales contratadas por el cliente (`numero_sesion = 1..N`).
- **Sincronización de Locación**: La dirección de rodaje configurada en el cliente se hereda automáticamente a las sesiones y se precarga en la vista de reserva con acceso directo a Google Maps.
- **Reglas Estrictas de Agendamiento**:
  - Restricción estricta de días hábiles (Lunes a Viernes).
  - Ventana mínima de antelación obligatoria (mínimo 72 horas posteriores a la fecha actual).
- **Protocolo de SLA de Filmación (`ProductionSlaWarningDialog`)**:
  - Ventana de cancelación y reagendamiento con límite de 72 horas.
  - Sesiones no acumulables para meses posteriores.
  - Tolerancia máxima de 30 minutos al inicio del rodaje y tarifado de tiempo extra.
  - Notificación automática por email al equipo ante cualquier fecha confirmada por el cliente.
- **Control Financiero Operativo**: Registro de costos de producción, edición y viáticos por ciclo, con cálculo automático de margen bruto y rentabilidad neta.

### 5. Galería Multimedia & Almacenamiento Híbrido
- Soporte para imágenes (`.png`, `.jpg`, `.webp`) y video de alta definición (`.mp4`, `.mov`).
- Compresión de imágenes en cliente previa a la subida con `browser-image-compression`.
- Carga de video a Cloudflare R2 vía URLs prefirmadas de subida directa (`PUT`) para no saturar los límites de memoria de Vercel Functions.
- Rastreo de estado de archivos (`en_uso`) para proteger los activos vinculados a publicaciones activas contra eliminaciones accidentales.

### 6. Configuración de Agencia & Pasarela de Pagos
- Menú de administración accesible desde el avatar del usuario en el Dashboard (`BankSettingsModal`).
- Configuración dinámica de banco emisor, beneficiario, CLABE interbancaria (18 dígitos) y teléfono de WhatsApp oficial (código internacional `+52` prefijado).
- Actualización inmediata en todas las propuestas públicas y tarjetas de reserva bloqueadas sin necesidad de redesplegar.

---

## 🎨 Sistema de Diseño: Clinical High-Tech Lab

Toda la interfaz sigue estrictamente las directrices del archivo de ADN visual del proyecto (`GEMINI.md`):

| Elemento | Especificación Oficial | Clases Tailwind / Identificadores |
| :--- | :--- | :--- |
| **Superficie Base** | Gris neutro de laboratorio | `bg-[#f4f4f4]` o `bg-gray-50` |
| **Acento Primario (Magenta)** | Formulab Brand Magenta | `#ef18d6` (`text-brand-magenta`, `bg-brand-magenta`) |
| **Acento Secundario (Azul)** | Formulab Electric Blue | `#188ff0` (`text-brand-blue`, `bg-brand-blue`) |
| **Gradiente de Laboratorio** | Lab Gradient Oficial | `linear-gradient(135deg, #ef18d6 0%, #188ff0 100%)` |
| **Tipografía Display** | Títulos, badges de impacto y métricas | `font-sora` (`Sora, sans-serif`) |
| **Tipografía Lectura / UI** | Textos corporales, inputs y formularios | `font-inter` (`Inter, sans-serif`) |
| **Tipografía Técnica** | Claves, fechas, IDs clínicos y horas | `font-mono` (`JetBrains Mono, monospace`) |
| **Contenedor Modal Base** | Shell unificado para formularios | [BaseFormModal.jsx](src/components/common/BaseFormModal.jsx) |
| **Modal de Confirmación** | Diálogo destructivo unificado | [ConfirmDeleteModal.jsx](src/components/dashboard/common/ConfirmDeleteModal.jsx) |

---

## 📂 Estructura del Proyecto

```
theFormulabsSite/
├── api/                           # Funciones Serverless de Vercel (Node.js)
│   ├── contact.js                 # Handler para envíos de contacto
│   ├── diagnostic.js              # Ingesta segura de diagnósticos
│   ├── notify-booking.js          # Alertas por email de reservas de rodaje
│   ├── notify-lead.js             # Notificaciones de nuevos leads vía Resend
│   ├── notify-payment-unlocked.js # Confirmación de desbloqueo de pagos
│   ├── proposal.js                # Operaciones privilegiadas de propuestas
│   ├── r2-presigned-url.js        # Generación de URLs prefirmadas en Cloudflare R2
│   └── upload-r2.js               # Subida directa de archivos a R2
├── public/                        # Activos estáticos, iconos y favicons
├── src/
│   ├── components/
│   │   ├── auth/                  # Guardias de ruta protegida (ProtectedRoute)
│   │   ├── booking/               # Componentes de reserva de rodajes y SLA
│   │   ├── calendar/              # Grillas de calendario, carruseles y visores
│   │   ├── common/                # Componentes reutilizables unificados (BaseFormModal, ConfirmDeleteModal, SlugPreviewField)
│   │   ├── dashboard/             # Módulos del panel de control:
│   │   │   ├── calendar/          # Gestión de calendarios, importador Word
│   │   │   ├── common/            # Modales compartidos de configuración bancaria
│   │   │   ├── diagnostics/       # Expedientes clínicos y detalle de leads
│   │   │   ├── gallery/           # Galería de medios y tarjetas de assets
│   │   │   ├── operations/        # Sesiones de producción y control de costos
│   │   │   └── proposals/         # Editor de propuestas, versionado y cotizador
│   │   ├── landing/               # Secciones de la landing y diagnóstico
│   │   ├── proposal/              # Vistas públicas de propuestas y activación
│   │   └── ui/                    # Primitivas atómicas de shadcn/ui
│   ├── context/                   # Contextos globales (AuthContext, UploadContext)
│   ├── data/                      # Catálogos estáticos, síntomas y plantillas fijas
│   ├── hooks/                     # Custom React Hooks (mobile, focus, toast)
│   ├── lib/                       # Instancias cliente (supabase.js, utils.js)
│   ├── pages/                     # Páginas principales vinculadas a rutas
│   ├── services/                  # Capa de datos pura y comunicación API / Supabase
│   └── utils/                     # Helpers puros (formatters, docxParser, SLA)
├── supabase/
│   └── migrations/                # Migraciones SQL de esquema, RLS y Realtime
├── vercel.json                    # Cabeceras de seguridad HTTP y rewrites de API
├── vite.config.js                 # Configuración de empaquetado Vite
└── package.json                   # Dependencias y scripts del proyecto
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Lenguaje & Core** | React 18, JavaScript (ESModules), Vite 5 |
| **Estilos & UI** | Tailwind CSS 3, Radix UI Primitives, Lucide React, Framer Motion |
| **Gestión de Estado & Servidor** | TanStack React Query v5, Context API nativa |
| **Base de Datos & Auth** | Supabase (PostgreSQL 15+, Supabase Auth, Supabase Realtime) |
| **Almacenamiento de Medios** | Cloudflare R2 (S3 Client SDK) + Supabase Storage |
| **Notificaciones Transaccionales**| Resend SDK + Sonner (Toasts en cliente) |
| **Parseo & Optimización** | `mammoth` (extracción `.docx`), `browser-image-compression`, `jszip` |
| **Infraestructura & Edge** | Vercel Serverless Functions |

---

## 🔐 Variables de Entorno

Copia el archivo de plantilla `.env.example` para generar tu entorno local:

```bash
cp .env.example .env
```

| Variable | Descripción | Entorno |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | URL de tu instancia de Supabase | Frontend (Vite) |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anónima de Supabase con RLS | Frontend (Vite) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave secreta con privilegios elevados (Solo Node.js) | Backend (`api/`) |
| `R2_ACCOUNT_ID` | Identificador de cuenta de Cloudflare | Backend (`api/`) |
| `R2_BUCKET_NAME` | Nombre del bucket en Cloudflare R2 | Backend (`api/`) |
| `R2_ACCESS_KEY_ID` | ID de clave de acceso S3 para R2 | Backend (`api/`) |
| `R2_SECRET_ACCESS_KEY` | Clave secreta de acceso S3 para R2 | Backend (`api/`) |
| `R2_PUBLIC_DOMAIN` | Dominio público o CDN asignado al bucket R2 | Backend / Cliente |
| `R2_ENDPOINT` | Endpoint HTTPS de Cloudflare R2 | Backend (`api/`) |
| `RESEND_API_KEY` | API Key de Resend para despacho de emails | Backend (`api/`) |
| `LEAD_NOTIFICATION_TO_EMAIL` | Email de destino para alertas de nuevos leads | Backend (`api/`) |
| `LEAD_NOTIFICATION_FROM_EMAIL` | Remitente verificado en Resend | Backend (`api/`) |

> [!WARNING]
> En cumplimiento estricto con las reglas de seguridad, **únicamente** las variables con prefijo `VITE_` están expuestas al navegador. Las credenciales maestras (`SUPABASE_SERVICE_ROLE_KEY`, `R2_SECRET_ACCESS_KEY`, `RESEND_API_KEY`) residen exclusivamente en el entorno seguro de Node.js en las funciones serverless de `api/`.

---

## 💻 Instalación y Comandos

### Requisitos Previos
- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/theFormulabsSite.git
cd theFormulabsSite

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo local (puerto 8080 o default)
npm run dev
```

### Scripts Disponibles

```bash
# Servidor de desarrollo con Hot Module Replacement (HMR)
npm run dev

# Compilar para producción (minificación de bundle y assets)
npm run build

# Compilar en modo desarrollo (para depuración local de artefactos)
npm run build:dev

# Previsualizar la compilación de producción localmente
npm run preview

# Ejecutar el linter de código (ESLint)
npm run lint
```

---

## 🛡️ Seguridad & Despliegue en Producción

El proyecto está configurado para despliegue directo en **Vercel** (`vercel.json`), incluyendo cabeceras de seguridad estrictas en todas las respuestas:

- `X-Content-Type-Options: nosniff` (Previene ataques de MIME-type sniffing).
- `X-Frame-Options: DENY` (Protección contra Clickjacking).
- `Referrer-Policy: strict-origin-when-cross-origin` (Aislamiento de origen).
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS forzado a 2 años).
- `Permissions-Policy` (Bloqueo de acceso no autorizado a cámara, micrófono y geolocalización).

### Migraciones de Base de Datos
Las migraciones incrementales en `supabase/migrations/` deben ejecutarse en orden cronológico en el panel de SQL de Supabase para garantizar la integridad referencial (`ON DELETE CASCADE`), las políticas RLS y los canales de tiempo real.

---

<p align="center">
  <b>The Formulabs</b> — Laboratorio de marketing de alto rendimiento.<br>
  Diseñado con estándares clínicos y arquitectura moderna de escala.
</p>
