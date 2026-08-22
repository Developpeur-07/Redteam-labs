'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import PlannerModal from '@/components/PlannerModal';

/**
 * Composant client déclencheur du Planner IA sur la page Roadmap.
 * @param {{ jourNumero: number, domains: Array<{ id: string, nom: string }> }} props
 */
export default function PlannerTrigger({ jourNumero, domains = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl shadow-md shadow-cyan-500/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span>Générer avec IA</span>
      </button>

      <PlannerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        jourNumero={jourNumero}
        domains={domains}
        onSuccess={handleSuccess}
      />
    </>
  );
}
