import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfileForRoadmap } from '@/lib/roadmap';
import { getUserNotes } from '@/lib/notes';
import NotesView from '@/components/NotesView';

/**
 * Page /notes — Gestion et consultation des notes et write-ups.
 */
export default async function NotesPage() {
  const supabase = await createClient();
  const { profile, error: profileError } = await getProfileForRoadmap(supabase);

  if (profileError || !profile?.date_debut) {
    redirect('/onboarding');
  }

  // Récupération des notes et des domaines
  const [{ notes }, { data: domains }] = await Promise.all([
    getUserNotes(supabase, profile.user_id),
    supabase.from('domains').select('id, nom, description').order('nom'),
  ]);

  return (
    <NotesView
      initialNotes={notes || []}
      domains={domains || []}
    />
  );
}
