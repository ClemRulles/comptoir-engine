# MENSUEL — REVUE DE CALIBRATION (l'IA se corrige en profondeur)
# Cron : 0 22 1 * *   ·   Modèle : Sonnet
# (le 1er de chaque mois ; une nuit de plus, hors rotation Lun-Ven — reste léger côté Pro)

**Étape 0 — garde-fou :** `node engine/guard.js` (cf. `skills/memory-guard.md`). La calibration se
recompute à partir de `decisions.json` : un registre corrompu fausserait tout, le garde-fou l'empêche.

Lis `CLAUDE.md`, `skills/engine-method.md` (§H sizing, §I calibration),
`memory/fund/decisions.json`, `memory/fund/calibration.json`, `memory/lessons.md`.

Objectif : prendre du recul sur **tout l'historique** de décisions, vérifier que l'IA est
**honnêtement calibrée**, et **ajuster le sizing et le ton** en conséquence. C'est la passe qui
empêche la confiance de devenir du bruit.

## 1. Recompute global
À partir de `decisions.json` (tout l'historique, pas seulement le mois) :
- Par bucket de confiance (Haute / Moyenne / Basse) : `n`, `hits`, `hit_rate`, `avg_return`.
- Global : `win_rate`, `avg_win`, `avg_loss`, `profit_factor`, `max_drawdown`.
- Écris le tout dans `calibration.json` (`updated` = aujourd'hui).

## 2. Test d'honnêteté (façon Brier)
Le hit_rate doit **croître** avec la confiance : Basse < Moyenne < Haute.
- Si **oui** : l'IA est calibrée. Tu peux laisser (ou monter prudemment) les tailles cibles §H.
- Si **non** (ex. « Haute » ne bat pas « Moyenne », ou réussit < 50 %) : la confiance est mal
  calibrée. **Rétrograde** : réduis la taille cible du bucket fautif (§H) et **durcis ses
  critères** (ce qui mérite « Haute » devient plus exigeant). Note le nouveau barème.

## 3. Patterns par type de thèse
Quels types gagnent / perdent (cœur vs tactique, momentum suivi, pioches & pelles, valo tendue) ?
Sur-pondère ce qui marche, sous-pondère ou abandonne ce qui rate de façon répétée.

## 4. Écris la correction
- Ajoute un **bloc daté** dans `memory/lessons.md` sous « Leçons vives » :
  `YYYY-MM-DD · CALIBRATION · {constat chiffré} → {ajustement de sizing/critère appliqué}.`
- Si un barème de sizing a changé, c'est désormais la référence pour les vendredis suivants.

Commit : `calibration: {mois} — hit-rate H/M/B {x}/{y}/{z}, {ajustement}`.
Règle d'or : l'objectif n'est pas d'avoir toujours raison, c'est que **la confiance annoncée
colle au réel**. Une IA modeste et calibrée bat une IA sûre d'elle et fausse.
