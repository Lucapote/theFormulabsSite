import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ProposalView from "@/components/proposal/ProposalView";
import { DEFAULT_PROPOSAL_TEMPLATE as defaultData } from "@/data/proposalData";
import { fetchProposalBySlug } from "@/services/proposalService";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ProposalPage() {
  const { slug } = useParams();
  const [proposalData, setProposalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProposal() {
      setLoading(true);
      setError(null);

      // Default static fallback for casecool
      if (slug?.toLowerCase() === "casecool" || !slug) {
        setProposalData(defaultData);
        setLoading(false);
        return;
      }

      const res = await fetchProposalBySlug(slug);
      if (res.success && res.data) {
        setProposalData(res.data);
      } else {
        setError(res.error || `No se encontró la propuesta para "${slug}".`);
      }
      setLoading(false);
    }

    loadProposal();
  }, [slug]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-inter">
        <div className="max-w-md text-center p-8 border-2 border-neutral-900 bg-white">
          <AlertCircle className="w-10 h-10 text-brand-magenta mx-auto mb-4" />
          <h1 className="text-2xl font-sora font-extrabold text-neutral-900 mb-2">Propuesta no encontrada</h1>
          <p className="text-sm text-neutral-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block h-10 px-6 bg-neutral-900 text-white font-sora font-bold text-xs uppercase tracking-wider leading-10 hover:bg-brand-magenta transition-colors"
          >
            Ir a The Formulab
          </Link>
        </div>
      </div>
    );
  }

  return <ProposalView data={proposalData} />;
}
