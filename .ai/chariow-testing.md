# Intégration et test de paiement Chariow

## Configuration

1. Exécuter `supabase/migrations/08_chariow_payments.sql` dans le projet Supabase.
2. Définir les variables de `.env.example` dans `.env.local` en local et dans les variables Vercel en production. `CHARIOW_API_KEY`, `CHARIOW_PULSE_SECRET` et `SUPABASE_SERVICE_ROLE_KEY` sont des secrets serveur : ne jamais les préfixer par `NEXT_PUBLIC_`.
3. Dans Chariow, publier un produit compatible avec l’API Checkout et renseigner son identifiant `prd_...` dans `CHARIOW_PRODUCT_ID`.
4. Dans **Automations → Pulses**, créer un Pulse HTTPS vers `https://<domaine>/api/webhooks/chariow`, sélectionner **Successful Sale**, **Failed Sale** et **Abandoned Sale**, puis copier son secret de signature dans `CHARIOW_PULSE_SECRET`.
5. Définir `NEXT_PUBLIC_APP_URL` sur l’URL du site. En local, l’application doit être exposée en HTTPS pour que Chariow puisse joindre le webhook. En production, utiliser le domaine Vercel.
6. Après validation des valeurs, définir `NEXT_PUBLIC_CHARIOW_CHECKOUT_ENABLED=true` et redéployer.

Le prix et la devise sont configurés dans Chariow et confirmés sur sa page de paiement. Ne place aucun secret dans `.env.example` ou dans le navigateur.

## Vérification depuis l’expérience client

1. Se connecter avec un compte de test sans accès actif et ouvrir `/checkout`.
2. Vérifier que le précontrôle retrouve les tables Supabase et le produit Chariow. Cette vérification ne crée pas de paiement et ne débite rien.
3. Dans Chariow, utiliser **Send test pulse** et vérifier que la livraison répond HTTP `200`. Le Pulse de test valide la signature/réception seulement; il ne donne pas l’accès.
4. Pour tester la transaction complète, continuer vers le checkout Chariow, vérifier le prix affiché et confirmer seulement si un débit réel est acceptable.
5. Vérifier ensuite **Ventes** et **Livraisons** dans Chariow; la vente doit être complétée, le webhook répondre `200`, et CyberRoad doit activer l’accès puis ouvrir l’onboarding.

## Limites

L’intégration actuelle active l’accès après une vente complétée et enregistre les ventes échouées ou abandonnées. Elle ne synchronise pas automatiquement les renouvellements, résiliations ou remboursements d’un abonnement. Après un remboursement, un administrateur doit révoquer l’accès dans `user_entitlements`. Ne considère pas un abonnement prêt pour la production avant d’avoir intégré et testé son cycle de vie complet.
