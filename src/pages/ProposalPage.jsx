import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import ProposalView from "@/components/proposal/ProposalView";
import { DEFAULT_PROPOSAL_TEMPLATE as defaultData } from "@/data/proposalData";
import { fetchProposalBySlug, incrementProposalViews } from "@/services/proposalService";
import { AlertCircle, RefreshCw, Lock } from "lucide-react";

export default function ProposalPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get("token");

  const [proposalData, setProposalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrivateError, setIsPrivateError] = useState(false);

  useEffect(() => {
    async function loadProposal() {
      setLoading(true);
      setError(null);
      setIsPrivateError(false);

      // Default static fallback for casecool
      if (slug?.toLowerCase() === "casecool" || !slug) {
        setProposalData(defaultData);
        setLoading(false);
        return;
      }

      const res = await fetchProposalBySlug(slug);
      if (res.success && res.data) {
        const proposal = res.data;
        const requiredToken = proposal.token || proposal.contenido?.token;

        // Verify Google Docs-style unlisted private token
        if (requiredToken && requiredToken !== urlToken) {
          setIsPrivateError(true);
          setProposalData(null);
        } else {
          setProposalData(proposal);
          // Increment view counter silently
          if (proposal.slug || proposal.id) {
            incrementProposalViews(proposal);
          }
        }
      } else {
        setError(res.error || `No se encontró la propuesta para "${slug}".`);
      }
      setLoading(false);
    }

    loadProposal();
  }, [slug, urlToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-inter p-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-brand-magenta animate-spin" />
          <span className="font-sora text-sm font-bold uppercase tracking-widest text-neutral-900">
            Cargando propuesta clínica...
          </span>
        </div>
      </div>
    );
  }

  // Google Docs style private link access error
  if (isPrivateError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-inter">
        <div className="max-w-md w-full text-center p-8 md:p-10 rounded-[2rem] bg-white shadow-2xl border border-gray-100">
          <div className="w-14 h-14 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-pink-500" />
          </div>
          <span className="inline-block text-[10px] font-sora font-bold text-pink-600 bg-pink-50 uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            DOCUMENTO PRIVADO
          </span>
          <h1 className="text-2xl font-sora font-extrabold text-gray-900 mb-2 tracking-tight">
            Acceso Privado Restringido
          </h1>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Esta propuesta es confidencial y solo se puede visualizar utilizando el enlace completo que incluye la clave de acceso.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center h-11 px-6 bg-gray-900 hover:bg-gray-800 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all"
          >
            Ir a The Formulab
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-inter">
        <div className="max-w-md w-full text-center p-8 md:p-10 rounded-[2rem] bg-white shadow-2xl border border-gray-100">
          <AlertCircle className="w-10 h-10 text-pink-500 mx-auto mb-4" />
          <h1 className="text-2xl font-sora font-extrabold text-gray-900 mb-2">Propuesta no encontrada</h1>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center h-11 px-6 bg-gray-900 hover:bg-gray-800 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all"
          >
            Ir a The Formulab
          </Link>
        </div>
      </div>
    );
  }

  return <ProposalView data={proposalData} />;
}
