# Playbook — la jurisprudence du moteur

Ici vivent les **amendements de méthode que le moteur s'est prouvés à lui-même**. C'est la
différence entre NOTER une leçon (journal `lessons.md`, chronologique, archivé) et APPRENDRE :
une règle du playbook est **appliquée par toutes les routines**, testée, puis confirmée ou
retirée selon les preuves. Le moteur s'améliore ici, pas dans ses souvenirs.

## Hiérarchie (non négociable)
`CLAUDE.md` (constitution) > verrous durs de la méthode (§H : 🔴 interdit/sortie forcée,
plafonds, plancher de cash, garde-fou drawdown) > **ce playbook** > défauts de la méthode.
Un amendement peut **durcir ou préciser** une règle, jamais assouplir un verrou dur ni
contredire la constitution. En cas de conflit, le niveau supérieur gagne.

## Règles du jeu
- **Naissance (vendredi, PASSE 1)** : max **1 amendement nouveau par semaine**, et seulement
  s'il s'appuie sur **≥ 3 cas concordants** cités (décisions scorées de `decisions.json` et/ou
  leçons datées de `lessons.md`). Pas de cas, pas de règle — le droit au blanc s'applique ici aussi.
- **Falsifiable ou rien** : chaque amendement écrit SON falsificateur — l'observation concrète
  qui le fera retirer. Une règle qu'aucun résultat ne peut invalider est du dogme, pas de
  l'apprentissage.
- **Vie (revue mensuelle)** : un amendement `à l'essai` depuis ≥ 4 semaines est jugé sur les
  décisions prises SOUS cette règle → `confirmé` (l'effet mesuré va dans son sens) ou `retiré`
  (falsificateur déclenché, ou aucun effet mesurable après 2 revues). On note l'effet, on ne
  vote pas au feeling.
- **Plafond : 10 amendements actifs.** Au-delà, la revue mensuelle retire le moins utile avant
  d'en confirmer un nouveau. Un playbook obèse ne s'applique plus.
- Les amendements retirés descendent aux Archives avec la raison — se souvenir de ce qui n'a
  PAS marché est aussi de l'apprentissage.

## Format d'un amendement
```
### P-00N · {titre court} · {statut: à l'essai | confirmé} · {date}
Règle : {une consigne impérative, applicable telle quelle par une routine}
Preuves : {≥3 références datées — décisions/leçons}
Falsificateur : {ce qui ferait retirer la règle}
Effet mesuré : {rempli par les revues mensuelles ; « pas encore évalué » au départ}
```

---

## Amendements actifs

### P-001 · Stop USD natif pour les positions US · confirmé · 2026-08-07 → 2026-09-05
Règle : pour toute position US libellée en EUR, le stop de référence est le **stop en USD
natif** (avg_cost USD × 0,92). Un franchissement EUR-only ne déclenche jamais une vente si le
stop USD tient ET que la thèse est intacte. Vérifier le stop dans la devise de cotation, pas
dans la devise du book. Post-migration §H 30/08 : pour les positions CŒUR, le seuil USD sert
de **référence de monitoring** (saisine mercredi si franchi), jamais de déclencheur automatique.
Preuves : 2026-07-04 · CRH/STOP-EUR-vs-USD (« règle définitive » du moteur) ; 2026-07-03 ·
CRH/PRIX-DISCORDANT ; 2026-07-02 · CEG/STOP-🟢-vs-🟠 (breach partiellement FX) ; leçon
FX/STOP-SYSTÉMIQUE antérieure.
Falsificateur : une position US dont le stop USD tenait mais qui aggrave sa perte de ≥ 8 %
supplémentaires pendant que l'« artefact FX » se révèle être un vrai mouvement — 2 cas suffisent.
Effet mesuré (revue sept. 2026) : 3 cas protecteurs identifiés — CEG EUR-stop franchi 19/08 (stop USD +25.7% intact → bonne décision de tenir), SAF.PA gate-flip discipline sans faux stop EUR, GVA signal nocturne $119.3 vs intraday $122-126 (04/09 : double-source aurait évité vente sur signal nocturne). Aucun cas négatif (coût d'artefact FX non matérialisé). CONFIRMÉ.

### P-002 · Double source de prix avant toute exécution proche du stop · à l'essai · 2026-08-07
Règle : pour toute position dont le cours `signals.js` est à < 2 % du stop, **recouper avec une
seconde source indépendante** (Yahoo direct, presse financière) AVANT d'exécuter. Écart > 5 %
entre deux sources = signal d'artefact → stop suspendu ce soir-là, à re-vérifier au prochain
passage, jamais une vente sur la source unique.
Preuves : 2026-07-03 · CRH/PRIX-DISCORDANT ($8,96 d'écart entre sources) ; 2026-07-09 ·
CRH/STOP-USD-FRANCHI-POUR-DE-VRAI (le protocole double-source a permis de distinguer le vrai
franchissement de l'artefact) ; leçon MSCI/STOP-PÉRIMÉ.
Falsificateur : un soir où la double source retarde une sortie qui aurait évité ≥ 5 % de perte
supplémentaire (le coût du délai dépasse le bénéfice anti-artefact) — 2 cas suffisent.
Effet mesuré : pas encore évalué.

### P-003 · Gate élevé ≠ acheter — valo, marge et redondance tranchent · confirmé · 2026-08-07 → 2026-09-05
Règle : un gate quantitatif élevé (même F9/9) est une condition **nécessaire, jamais suffisante**.
Avant tout Acheter : (a) le DCF inversé laisse une marge de sécurité dans le régime courant —
en SURCHAUFFE elle doit être réelle, pas espérée ; (b) si le book détient déjà le même thème en
moins cher, la **redondance est une raison valable de refuser** le nom premium ; (c) un repli
de prix n'est une opportunité que si sa cause ne frappe pas le produit qui EST la thèse.
Preuves : 2026-07-09 · DEEP-DIVE/GATE-ÉLEVÉ-≠-ACHETER (VMC/GVA, « deux règles » du moteur) ;
2026-07-02 · ABT/SCOUT-À-CÔTÉ (piège de valeur) ; 2026-07-02 · REGIME/BLANC-DISCIPLINÉ
(LLY/UNH/ABT, 3 Surveiller).
Falsificateur : ≥ 3 candidats refusés sur cette règle qui délivrent ensuite un alpha > 0 sur
leur horizon pendant que le book sous-performe — la prudence serait devenue du coût d'opportunité.
Effet mesuré (revue sept. 2026) : 3 cas concordants post-création : MYRG vs GVA 20/08 (gate +0.732 refusé vs GVA 17x → correct, GVA tenu et gate fort), AZZ vs EME 27/08 (gate +0.732 momentum-porté refusé, EME gate +0.495 acheté avec marge réelle), ABBV vs CB 03/09 (gate le plus fort de la nuit Surveiller, CB plus faible Acheter conditionnel). Aucun des refusés n'a livré d'alpha observé supérieur à la décision retenue sur l'horizon disponible. CONFIRMÉ.

---

## Archives (amendements retirés)

*(vide — aucun amendement retiré pour l'instant)*
