import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePlannerTasks } from '@/lib/planner';
import { clampDayNumber } from '@/lib/roadmap';

/**
 * POST /api/planner/generate
 * Génère et insère dynamiquement des tâches adaptées avec l'Agent IA Planner pour un jour spécifique.
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    // 1. Vérification auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 2. Body parameters
    const body = await request.json();
    const { jourNumero: rawJour, domainNom, focusTopic, replaceExisting = false } = body;

    const jourNumero = clampDayNumber(rawJour || 1);

    // 3. Profil utilisateur (objectif)
    const { data: profile } = await supabase
      .from('profiles')
      .select('objectif')
      .eq('user_id', user.id)
      .maybeSingle();

    const userGoal = profile?.objectif || 'Ingénieur Cybersécurité';

    // 4. Domaines existants en BDD
    const { data: domains, error: domainsErr } = await supabase
      .from('domains')
      .select('id, nom');

    if (domainsErr || !domains || domains.length === 0) {
      return NextResponse.json({ error: 'Aucun domaine de compétence trouvé en BDD.' }, { status: 500 });
    }

    // Map nom -> id
    const domainMap = new Map();
    domains.forEach((d) => domainMap.set(d.nom.toLowerCase(), d.id));
    const fallbackDomainId = domains[0].id;

    // 5. Récupérer ou créer la journée dans roadmap_days
    let { data: day, error: dayErr } = await supabase
      .from('roadmap_days')
      .select('id, jour_numero, titre')
      .eq('jour_numero', jourNumero)
      .maybeSingle();

    if (dayErr) {
      return NextResponse.json({ error: dayErr.message }, { status: 500 });
    }

    // 6. Tâches actuelles
    let existingTasks = [];
    if (day) {
      const { data: t } = await supabase
        .from('roadmap_tasks')
        .select('id, titre, description')
        .eq('roadmap_day_id', day.id);
      existingTasks = t || [];
    }

    // 7. Appel IA Planner
    const plannerResult = await generatePlannerTasks({
      jourNumero,
      goal: userGoal,
      domainNom,
      focusTopic,
      existingTasks,
    });

    if (plannerResult.error) {
      return NextResponse.json({ error: plannerResult.error }, { status: 400 });
    }

    // Si la journée n'existait pas, l'insérer
    if (!day) {
      const { data: newDay, error: createDayErr } = await supabase
        .from('roadmap_days')
        .insert({
          jour_numero: jourNumero,
          titre: plannerResult.titreJour || `Jour ${jourNumero} : Défi personnalisé IA`,
        })
        .select('id, jour_numero, titre')
        .single();

      if (createDayErr) {
        return NextResponse.json({ error: `Impossible de créer la journée : ${createDayErr.message}` }, { status: 500 });
      }
      day = newDay;
    } else if (plannerResult.titreJour) {
      // Mettre à jour le titre du jour si fourni par l'IA
      await supabase
        .from('roadmap_days')
        .update({ titre: plannerResult.titreJour })
        .eq('id', day.id);
      day.titre = plannerResult.titreJour;
    }

    // 8. Remplacement des tâches si demandé
    if (replaceExisting && day) {
      await supabase.from('roadmap_tasks').delete().eq('roadmap_day_id', day.id);
    }

    // 9. Insertion des nouvelles tâches
    const tasksToInsert = plannerResult.tasks.map((task, idx) => {
      const matchedId = domainMap.get((task.domainNom || '').toLowerCase()) || fallbackDomainId;
      return {
        roadmap_day_id: day.id,
        domain_id: matchedId,
        titre: task.titre,
        description: task.description,
        ordre: (replaceExisting ? 0 : existingTasks.length) + idx + 1,
      };
    });

    const { data: createdTasks, error: insertTasksErr } = await supabase
      .from('roadmap_tasks')
      .insert(tasksToInsert)
      .select(`
        id,
        titre,
        description,
        ordre,
        domain:domains (
          id,
          nom,
          description
        )
      `);

    if (insertTasksErr) {
      return NextResponse.json({ error: `Erreur lors de l'enregistrement des tâches : ${insertTasksErr.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      day,
      tasks: createdTasks,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
