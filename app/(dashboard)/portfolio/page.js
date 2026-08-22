import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfileForRoadmap } from '@/lib/roadmap';
import { getProgressionOverview } from '@/lib/progression';
import { getAllBadgesWithUserStatus } from '@/lib/badges';
import { getUserNotes } from '@/lib/notes';
import PortfolioView from '@/components/PortfolioView';

/**
 * Page Portfolio Apprenant (Phase 9) — Vitrine consolidée des compétences, badges et write-ups.
 */
export default async function PortfolioPage() {
  const supabase = await createClient();
  const { profile, user, error: profileError } = await getProfileForRoadmap(supabase);

  if (profileError || !profile?.date_debut) {
    redirect('/onboarding');
  }

  const userId = user?.id || profile?.user_id;

  const [
    overview,
    { badges },
    { notes },
    { data: domains },
  ] = await Promise.all([
    getProgressionOverview(supabase, userId),
    getAllBadgesWithUserStatus(supabase, userId),
    getUserNotes(supabase, userId),
    supabase.from('domains').select('id, nom').order('nom'),
  ]);

  const enrichedProfile = {
    ...profile,
    user_email: user?.email || 'Apprenant CyberRoad',
  };

  return (
    <PortfolioView
      profile={enrichedProfile}
      overview={overview}
      badges={badges || []}
      notes={notes || []}
      domains={domains || []}
    />
  );
}
