# Modules de découverte

Un fichier JSON par module, au format du prompt (`interface/lib/learn/prompt.ts`).
Le nom du fichier est l'adresse du module : `content/modules/bulle-des-tulipes.json` → `/apprendre/bulle-des-tulipes`.

## Ajouter un module (checklist)
1. Coller le JSON reçu dans Apprendre → Aperçu et lire les remarques.
2. Vérifier les faits fragiles (chiffres, dates, citations) contre les sources citées ; signaler
   les doutes à Clément plutôt que réécrire le texte de l'auteur.
3. Déposer le fichier ici et le déclarer dans `interface/lib/learn/registry.ts`.
4. **Passe visuelle obligatoire** (demande de Clément) : chaque nouveau module doit être
   beaucoup plus beau qu'un simple empilement de blocs, moderne et dans l'esprit de l'app :
   - lui donner un `look` dans le registre : couleur d'accent (`vert`, `bleu`, `violet`, `teal`,
     `rose` ; jamais l'orange, réservé au fonds IA) et une image de couverture libre de droits
     vérifiée (Wikimedia Commons, crédit + licence + page) ;
   - transformer les images décrites en blocs `libre` en vrais blocs `image` quand une image
     libre existe ;
   - si le module apporte une forme nouvelle (bloc `libre` ou type inconnu), lui créer un rendu
     sur mesure dans `components/learn/ModuleView.tsx` ;
   - vérifier sur mobile (390 px) et ordinateur, clair et sombre, captures à l'appui, avant la PR.
