import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  GitBranch,
  CopyPlus,
  FileText,
  ChevronDown,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Edit2,
  Trash2,
  UserPlus,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

const formatVersionDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
};

export default function ProposalRow({
  group,
  convertedIds,
  copiedSlug,
  onCopyLink,
  onEditClick,
  onDeleteClick,
  onConvertClick,
  onNewVersionClick
}) {
  const versiones = group?.versiones || [];
  const [selectedVersionId, setSelectedVersionId] = useState(versiones[0]?.id);

  // Sincronizar si cambia el grupo de versiones
  useEffect(() => {
    if (versiones.length > 0 && !versiones.some((v) => v.id === selectedVersionId)) {
      setSelectedVersionId(versiones[0]?.id);
    }
  }, [versiones, selectedVersionId]);

  const versionActiva = versiones.find((v) => v.id === selectedVersionId) || versiones[0] || {};
  const isConverted = versionActiva.id && convertedIds?.has(versionActiva.id);
  const hasMultipleVersions = versiones.length > 1;

  return (
    <tr className="hover:bg-pink-50/30 transition-colors">
      {/* 1. Cliente / Marca y Selector de Versiones */}
      <td className="p-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-sora font-bold text-gray-900 text-base leading-tight">
              {versionActiva.cliente || versionActiva.shortName || versionActiva.slug}
            </span>

            {/* Selector de Versión */}
            {hasMultipleVersions ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#188ff0] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-full cursor-pointer transition-all shadow-2xs"
                    title="Desplegar árbol de versiones"
                  >
                    <GitBranch className="w-3 h-3 text-[#188ff0]" />
                    <span>v{versionActiva.version || 1}</span>
                    <span className="text-gray-400 font-normal">({versiones.length})</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 font-inter text-xs z-50"
                >
                  <div className="px-2.5 py-1 text-[10px] font-sora font-bold text-gray-400 uppercase tracking-wider">
                    Historial de Iteraciones
                  </div>
                  {versiones.map((v) => {
                    const isSelected = v.id === versionActiva.id;
                    const dateLabel = formatVersionDate(v.created_at);
                    return (
                      <DropdownMenuItem
                        key={v.id || v.slug}
                        onClick={() => setSelectedVersionId(v.id)}
                        className={`flex items-start justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 text-[#188ff0] font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs">v{v.version || 1}</span>
                            {dateLabel && <span className="text-[11px] text-gray-400">({dateLabel})</span>}
                            {isSelected && (
                              <span className="text-[10px] bg-blue-100 text-[#188ff0] px-1.5 py-0.2 rounded-full font-bold">
                                Activa
                              </span>
                            )}
                          </div>
                          {v.notas_version && (
                            <p
                              className="text-[11px] text-gray-500 truncate max-w-[210px] mt-0.5 italic"
                              title={v.notas_version}
                            >
                              "{v.notas_version}"
                            </p>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#188ff0] shrink-0 mt-0.5" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full">
                <GitBranch className="w-3 h-3 text-gray-400" />
                <span>v{versionActiva.version || 1}</span>
              </span>
            )}
          </div>

          <span className="text-xs text-gray-500">
            {versionActiva.contenido?.client?.proposalTitle || "Propuesta de Contenido"}
          </span>

          {/* Notas de Negociación visibles */}
          {versionActiva.notas_version && (
            <div
              className="inline-flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-600 bg-gray-50 border border-gray-200/70 rounded-md px-2 py-0.5 max-w-fit"
              title={versionActiva.notas_version}
            >
              <FileText className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate max-w-[240px] italic">"{versionActiva.notas_version}"</span>
            </div>
          )}
        </div>
      </td>

      {/* 2. URL (Slug) */}
      <td className="p-5">
        <span className="inline-block font-mono text-xs font-semibold text-pink-600 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full">
          /{versionActiva.slug}
        </span>
      </td>

      {/* 3. Vistas */}
      <td className="p-5 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-sora font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
          <Eye className="w-3.5 h-3.5 text-pink-500 shrink-0" />
          {versionActiva.contenido?.views || versionActiva.views || 0}
        </span>
      </td>

      {/* 4. Fecha */}
      <td className="p-5 text-xs text-gray-500 font-medium">
        {versionActiva.created_at
          ? new Date(versionActiva.created_at).toLocaleDateString("es-MX", {
              year: "numeric",
              month: "short",
              day: "numeric"
            })
          : "Fecha N/A"}
      </td>

      {/* 5. Acciones */}
      <td className="p-5 text-right whitespace-nowrap">
        <div className="inline-flex items-center justify-end gap-1.5 flex-nowrap">
          {/* Botón de Nueva Versión */}
          <Button
            type="button"
            onClick={() => onNewVersionClick(versionActiva)}
            className="rounded-full h-8 px-3 text-xs font-sora font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all border border-gray-200/60"
            title="Crear nueva iteración a partir de esta versión"
          >
            <CopyPlus className="w-3.5 h-3.5 text-[#188ff0]" />
            <span>Nueva Versión</span>
          </Button>

          {/* 1-Click Onboarding a Cliente */}
          {isConverted ? (
            <span
              title="Propuesta ya convertida en cliente activo con ciclo mensual"
              className="h-8 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-sora font-bold inline-flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cliente Activo</span>
            </span>
          ) : (
            <button
              onClick={() => onConvertClick(versionActiva)}
              title="Convertir propuesta en cliente y activar ciclo mensual"
              className="h-8 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-xs font-sora font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98] shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Convertir en Cliente</span>
            </button>
          )}

          {/* Copiar Enlace */}
          <button
            onClick={() => onCopyLink(versionActiva)}
            title="Copiar enlace privado"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 inline-flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            {copiedSlug === versionActiva.slug ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Ver en vivo */}
          <Link
            to={
              versionActiva.contenido?.token
                ? `/${versionActiva.slug}?token=${versionActiva.contenido.token}`
                : `/${versionActiva.slug}`
            }
            target="_blank"
            rel="noopener noreferrer"
            title="Ver propuesta en vivo"
            className="w-8 h-8 rounded-full bg-blue-50 hover:bg-[#188ff0] text-[#188ff0] hover:text-white inline-flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Editar */}
          <button
            onClick={() => onEditClick(versionActiva)}
            title="Editar propuesta"
            className="w-8 h-8 rounded-full bg-gray-900 hover:bg-pink-500 text-white inline-flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Eliminar */}
          <button
            onClick={() => onDeleteClick?.(versionActiva, group?.versiones?.length || 1)}
            title="Eliminar propuesta"
            className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-500 text-red-600 hover:text-white inline-flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
