# Recetas de Componentes Táctiles (Tailwind CSS)

Recetas y clases listas para copiar y pegar en componentes React, construidas para garantizar tactilidad física y acabado de alta fidelidad.

---

## 1. Selector Segmentado en Cápsula (Segmented Pill Switcher)

Reemplaza radio buttons o pestañas feas por un contenedor suave con pastilla activa deslizable:

```jsx
<div className="flex bg-gray-100 p-1 rounded-full border border-gray-200 gap-1 w-full max-w-md">
  <button
    type="button"
    onClick={() => setTab("primero")}
    className={`flex-1 py-2 px-4 font-sora text-xs font-bold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer ${
      tab === "primero"
        ? "bg-gray-900 text-white shadow-md"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
    }`}
  >
    <FileText className={`w-3.5 h-3.5 ${tab === "primero" ? "text-pink-400" : "text-gray-400"}`} />
    <span>1. Información</span>
  </button>

  <button
    type="button"
    onClick={() => setTab("segundo")}
    className={`flex-1 py-2 px-4 font-sora text-xs font-bold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer ${
      tab === "segundo"
        ? "bg-gray-900 text-white shadow-md"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
    }`}
  >
    <DollarSign className={`w-3.5 h-3.5 ${tab === "segundo" ? "text-brand-blue" : "text-gray-400"}`} />
    <span>2. Facturación</span>
  </button>
</div>
```

---

## 2. Botón de Acción Principal con Feedback Táctil

Tiene altura cómoda para pulgar (44px), radio de cápsula, tipografía Sora en mayúsculas espaciadas, sombra con color del acento y compresión al tacto (`active:scale-[0.98]`):

```jsx
<button
  type="button"
  className="h-11 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
>
  <CheckCircle className="w-4 h-4" />
  <span>Confirmar Reserva</span>
</button>
```

---

## 3. Cajón Deslizable para Móvil (Instagram Bottom Sheet Handle)

Para visores de publicaciones, fichas técnicas o copys en pantallas móviles (`< 768px`):

```jsx
<div className="fixed inset-x-0 bottom-0 z-50 bg-slate-900/95 backdrop-blur-md rounded-t-[28px] border-t border-slate-800 p-4 pb-8 shadow-2xl transition-transform max-h-[60vh] flex flex-col">
  {/* Tactile Drag Handle */}
  <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto mb-3 cursor-grab shrink-0" />

  {/* Header */}
  <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
    <span className="font-sora font-bold text-xs text-white uppercase tracking-wider">
      Copywriting & Detalles
    </span>
    <span className="font-mono text-[11px] text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
      REEL 9:16
    </span>
  </div>

  {/* Body con scroll vertical suave */}
  <div className="flex-1 overflow-y-auto mt-3 space-y-3 font-inter text-xs text-slate-300 pr-1">
    <p className="leading-relaxed whitespace-pre-line">
      Aquí se coloca el texto enriquecido respetando los saltos de línea sin saltos horizontales...
    </p>
  </div>

  {/* Thumb-zone CTA Button */}
  <div className="pt-3 border-t border-slate-800 shrink-0">
    <button
      type="button"
      className="w-full h-12 rounded-full bg-brand-magenta hover:bg-pink-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
    >
      <Copy className="w-4 h-4" />
      <span>Copiar Texto Completo</span>
    </button>
  </div>
</div>
```

---

## 4. Tarjeta de Laboratorio Quirúrgica (Clinical Lab Card)

Bordes milimétricos, fondo blanco puro sobre superficie neutra y sombra flotante suave:

```jsx
<div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
  {/* Acento lateral opcional */}
  <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-brand-magenta to-brand-blue opacity-0 group-hover:opacity-100 transition-opacity" />

  <div className="flex items-start justify-between gap-3 mb-2">
    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-gray-400">
      ID-2026-X
    </span>
    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
      ACTIVO
    </span>
  </div>

  <h3 className="font-sora font-extrabold text-sm text-gray-900 mb-1">
    Título de Precisión
  </h3>
  <p className="font-inter text-xs text-gray-500 leading-relaxed">
    Descripción clínica clara sin adornos innecesarios.
  </p>
</div>
```
