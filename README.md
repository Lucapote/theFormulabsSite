# 🧪 The Formulabs — Panel de Control & Gestor de Estrategias

**The Formulabs** es una plataforma integral de diagnóstico, creación de propuestas comerciales y gestión de calendarios de contenidos para agencias y creadores de contenido. 

---

## 📌 Arquitectura del Dashboard

El **Panel de Control** (Dashboard) está estructurado en módulos estratégicos enfocados en la productividad y la automatización del flujo de trabajo de contenidos:

```
Dashboard
 ├── 📊 Gestor de Estrategias & Propuestas
 ├── 👥 Clientes y Calendarios de Contenido
 ├── 📅 Parrilla Editorial & Calendario Interactivo
 └── 📥 Importador Automático desde Word (.docx)
```

---

## 🚀 Funcionalidades Principales del Dashboard

### 1. Gestor de Estrategias y Propuestas (Fase 1)
- **Creación de Propuestas Clínicas de Contenido**: Formulario guiado para generar propuestas comerciales personalizadas por cliente.
- **Cotizador Dinámico**: Cálculo automático de precios por niveles de servicio (*Esencial*, *Crecimiento*, *Escala*) y adicionales (*Meta Ads*, *Manejo de Redes*, *Producción Pau Marca / Creadora*).
- **URLs slug personalizadas**: Generación automática de vistas web interactivas para que el cliente revise y acepte su propuesta online.
- **Métricas de Diagnóstico**: Registro y consulta de diagnósticos interactivos completados por prospectos.

### 2. Gestión de Clientes y Calendarios (Fase 2)
- **Directorio de Clientes**: Administración centralizada de clientes con búsqueda instantánea y eliminación en cascada segura (limpieza de archivos físicos en Supabase Storage).
- **Calendarios Mensuales**: Creación de calendarios asignados a clientes específicos por año, mes, plataformas (*Instagram*, *Facebook*, *TikTok*) y tipo de contenido (*Reels*, *Carruseles*).
- **Generación de "Cajas Vacías"**: Herramienta de un solo clic para generar borradores vacíos de Reels y Carruseles distribuidos durante el mes, listos para recibir copywriting y archivos multimedia.

### 3. Galería de Medios y Compresión Inteligente
- **Carga de Archivos Multimedia**: Soporte para imágenes (`.png`, `.jpg`, `.webp`) y videos (`.mp4`, `.mov`).
- **Compresión del lado del Cliente**: Optimización automática de imágenes antes de la subida a Supabase Storage mediante `browser-image-compression`.
- **Rastreo de Uso (`en_uso`)**: Control inteligente de archivos asignados a publicaciones para evitar eliminación accidental de medios activos.

### 4. Parrilla Editorial y Calendario Interactivo
- **Vista Doble**:
  - **Vista Lista (Cards)**: Gestión rápida de posts con copiar copywriting en 1 clic, filtros por estado (*Borrador*, *Programado*, *Publicado*) y tipo de contenido (*Reel*, *Carrusel*).
  - **Vista Cuadrícula Mensual**: Calendario interactivo con visualización de días, horas programadas e indicadores de estado.
- **Vista Pública del Cliente**: Enlace público (`/:clientSlug/:calendarSlug`, ej. `/yamamoto/octubre-2026`) que permite al cliente revisar las publicaciones aprobadas o programadas sin necesidad de autenticación.

### 5. Importador de Contenido desde Word (.docx)
- **Procesamiento 100% Client-Side**: No requiere APIs externas ni claves pagadas. Utiliza `mammoth.js` y un parser de expresiones regulares estructurado.
- **Detección Automática de Patrones**:
  - **Encabezados de fecha**: Reconoce patrones como `Sábado 10 de octubre — 8:00 PM` o `12 de noviembre - 10:30 AM`.
  - **Normalización**: Convierte fechas a `YYYY-MM-DD` y horas a formato 24h `HH:mm:ss`.
  - **Formatos**: Distingue automáticamente entre `Reel` y `Carrusel`.
  - **Copywriting**: Separa y concatena secciones de `Caption:` y `CTA:`.
- **Autorellenado Inteligente**: Reemplaza las "cajas vacías" borradores del calendario y crea nuevas publicaciones en Supabase si el documento excede el número de cajas.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Framer Motion, Sonner.
- **Backend & Almacenamiento**: Supabase (PostgreSQL Database, Storage Buckets `media-calendario`, RLS policies).
- **Librerías de Procesamiento**: `mammoth` (extracción `.docx`), `browser-image-compression`.

---

## 💻 Comandos del Proyecto

```bash
# Iniciar servidor de desarrollo local
npm run dev

# Compilar para producción
npm run build

# Previsualizar la build de producción
npm run preview
```
