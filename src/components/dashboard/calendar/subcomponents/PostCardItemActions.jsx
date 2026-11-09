import {
  ExternalLink,
  Loader2,
  Send,
  Check,
  Copy,
  Eye,
  Edit2,
  Trash2
} from "lucide-react";

/**
 * PostCardItemActions
 * Barra de acciones para un post individual en la lista de programados:
 * link en vivo, publicar ahora / reintentar (solo reel/carrusel), copiar caption,
 * previsualización (simulador), editar y eliminar.
 */
export default function PostCardItemActions({
  post,
  isEmptyBox,
  isPublishing,
  copiedPostId,
  onPublishNow,
  onCopyCaption,
  onSelectPreview,
  onEditPost,
  onDeletePost
}) {
  const isStory = post.tipo_post === "historia" || post.tipo_post === "story";

  return (
    <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
      {/* External Link to Published Post */}
      {post.estado === "publicado" && post.meta_permalink && (
        <a
          href={post.meta_permalink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="h-8 px-2.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-sora font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
          title="Abrir publicación en vivo"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ver en Meta</span>
        </a>
      )}

      {/* Retry or Manual Publish Now Button (Omitido para historias: publicación manual) */}
      {!isStory && onPublishNow && !isEmptyBox && (post.estado === "error" || post.estado === "programado") && (
        <button
          type="button"
          disabled={isPublishing}
          onClick={(e) => {
            e.stopPropagation();
            onPublishNow(post);
          }}
          className={`h-8 px-3 rounded-full font-sora font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
            post.estado === "error"
              ? "bg-rose-600 hover:bg-rose-700 text-white"
              : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
          }`}
          title={post.estado === "error" ? "Reintentar publicación en Meta" : "Publicar ahora sin esperar al cron"}
        >
          {isPublishing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{post.estado === "error" ? "Reintentar" : "Publicar Ahora"}</span>
        </button>
      )}

      {/* Copy Caption or Story Instructions */}
      {post.caption && (
        <button
          type="button"
          onClick={(e) => onCopyCaption(post.id, post.caption, e)}
          className="h-8 px-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-sora font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
          title={isStory ? "Copiar instrucciones de historia" : "Copiar copywriting"}
        >
          {copiedPostId === post.id ? (
            <Check className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* Instagram Simulator Preview */}
      {onSelectPreview && !isEmptyBox && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectPreview(post);
          }}
          className="h-8 px-2.5 rounded-full bg-pink-50 hover:bg-pink-100 text-brand-magenta border border-pink-200 font-sora font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          title={isStory ? "Previsualizar paquete de historias" : "Previsualizar en formato Instagram"}
        >
          <Eye className="w-3.5 h-3.5 text-brand-magenta" />
          <span className="hidden sm:inline">Previsualizar</span>
        </button>
      )}

      {/* Edit Post */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEditPost(post);
        }}
        className="h-8 px-3 rounded-full bg-blue-50 hover:bg-blue-100 text-brand-blue font-sora font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
        title="Editar publicación"
      >
        <Edit2 className="w-3.5 h-3.5" />
        <span>Editar</span>
      </button>

      {/* Delete Post */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDeletePost(post);
        }}
        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer"
        title="Eliminar publicación"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

