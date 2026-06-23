# Journal d'apprentissage

Une ligne datée par leçon actionnable. Alimenté par la passe d'apprentissage du **vendredi**
(trades clôturés) et la **revue mensuelle de calibration**. Une leçon vaut si elle change une
décision future : sizing, choix de thèse, timing, niveau de confiance.

Format : `YYYY-MM-DD · [TICKER ou MÉTHODE] · ce qui s'est passé → ce que je corrige.`

2026-06-23 · FOMC/MÉTHODE · Lundi W25, j'avais retenu "FOMC hold + 75 bps de coupes fin 2026" comme la lecture du marché — information de PRESSE PRÉ-RÉUNION. La SEP officielle du 17 juin révèle l'inverse : dot plot médiane 3.8% (vs 3.4%), 9/18 membres projettent ≥1 hausse, PCE 3.6% (vs 2.7%). La correction majeure de la lecture initiale arrive seulement en W26. → **Ne jamais consommer des projections de taux pré-réunion comme des faits établis ; lire le SEP officiel (Fed.gov) systématiquement 24-48h après la réunion pour corriger le régime.** Le dot plot est le document de référence, pas les dépêches pré-décision.

2026-06-23 · MÉTHODE/FCF-vs-Capex · AMZN −4.75% et GOOGL −6% le 22 juin sur FCF dégradé (AMZN −95%, GOOGL −47%) malgré des fondamentaux business intacts (AWS +28%). La compression FCF vient du capex massif ($452B combiné) pas d'un ralentissement du business. → **Distinguer "FCF comprimé par capex d'investissement" de "business en déclin" : le premier peut créer une fenêtre d'achat (RSI survendu, thèse intacte) ; le second exige une sortie. Pour AMZN, la thèse AWS reste valide tant que la guidance capex n'est pas coupée >15%. Vérifier la guidance capex Q2 (30 juillet) comme test de la thèse, pas la FCF trimestrielle seule.**

2026-06-23 · HO.PA/STOP · Stop HO.PA 226.61€ (avg_cost 246.32 × 0.92) touché cette semaine (cours 226.3€). La règle §H est sans ambiguïté : sortie forcée jeudi. → **Le stop est une règle mécanique, pas un objectif à optimiser. Une position 🟠 ambre au stop est une sortie, même à €0.31 sous le seuil. La latence de 3 jours (lundi → jeudi) est le coût d'un système ordonné ; l'accepter sans chercher à "attendre un rebond".**

2026-06-23 · SAF.PA/GATE-SIZING · SAF.PA gate 🟢→🟠 (RSI 73.5 suracheté, composite +0.132). Position 8.4% NAV > cap 5% §H. → **Le gate ambre n'est pas juste un signal de qualité — c'est un PLAFOND DE TAILLE. Dès que le gate bascule 🟢→🟠, une position doit être trimée jeudi même si la thèse reste intacte. "Thèse intacte" ≠ "taille inchangée". Le sizing suit le gate, pas seulement la conviction fondamentale.**

2026-06-20 · CEG/GATE · Gate CEG passé 🟠 ambre (composite +0.192, cov82%) le mercredi à 🟢 vert (composite +0.239, cov86%) le vendredi — la latence de 48h entre l'analyse et l'exécution a permis d'entrer à un gate amélioré et avec un sizing 7% NAV (Moyenne) au lieu du cap 5% ambre. → Respecter la fenêtre d'exécution vendredi-only pour les achats (§H) est un avantage structurel : non seulement ça évite le sur-trading, mais ça laisse le gate confirmer entre l'analyse et l'achat.

2026-06-20 · CALIBRATION/Semaine-2 · Aucune position fermée cette semaine (Doctor 19/06 : 0 sorties, benchmark +0.31%). Calibration inchangée (n<8 par bucket). → Pas de leçon de trade cette semaine — la discipline de non-action (garder le cash, ne pas forcer) EST la discipline : en régime SURCHAUFFE, rester en attente plutôt que d'entrer sur une conviction tiède est le meilleur trade.

2026-06-19 · BNP.PA/TECHNIQUE · RSI 77,5 + range52 0,992 sur BNP.PA — la thèse bancaire est intacte (ECB favorable, PNB Q1 +8,5 %) mais le titre consomme l'essentiel de son potentiel CT (~101 € vs objectif ~105 €). Gate 🟢 vert ne signifie pas « confort absolu » : un RSI suracheté + near-52w-high sur une position +49 % vs coût base est un signal de vigilance, pas de sortie. → En régime SURCHAUFFE, traiter le RSI-titre comme un signal d'alerte secondaire (soutient un À SURVEILLER) sans déclencher une vente : la thèse prime, mais la place pour un allègement partiel existe si la thèse sur le crédit se fragilise.

2026-06-19 · NOVOB/CATALYSEUR · Le Medicare GLP-1 Bridge (1er juillet, 65M+ seniors, 50$/mois Wegovy) est un catalyseur directionnel **connu et daté** — pas un pari sur une annonce surprise. Le groupe détient NOVOB avec une thèse intacte ; le book IA est sorti (gate 🔴 -0,43 le 12/06) et ne peut pas ré-entrer avant un redressement du gate. → Un catalyseur §J très fort ne relève pas un gate rouge (§H verrouillé), mais il justifie de **surveiller activement le gate au lendemain du 1er juillet** pour une ré-entrée rapide si le momentum se redresse.

2026-06-18 · AI/DATA · Le feed `signals.js` a affiché « CA YoY −35,7 % » sur Air Liquide, signal alarmant qui aurait pu déclencher une vente. Cause réelle : **attribution d'actions gratuites 1-pour-10 le 10/06** (reset mécanique du cours ~−9 %) + FX −5,9 %. Le CA réel a CRÛ en comparable (+1,9 %). → **Avant d'agir sur un mouvement extrême d'un compounder stable, vérifier les actions sur capital (split, attribution gratuite, dividende exceptionnel)** : un −36 % sur Air Liquide est *a priori* un artefact, pas un fait. Ajouter ce réflexe au Portfolio Doctor du jeudi avant toute vente sur signal aberrant.

2026-06-18 · HO.PA/GATE · Position flippée 🔴 (-0,201) mardi → « sortie forcée jeudi » planifiée, puis redressée 🟠 (-0,187) mercredi, au-dessus du stop, thèse intacte. → Confirme la leçon 06-12 : **un 🔴 à un cheveu du seuil (-0,2) et à couverture 39 % n'est pas définitif** ; le re-test du gate le jour de la fenêtre de sortie (jeudi) évite une vente sur un faux franchissement. Ne pas pré-engager une sortie forcée 2 jours à l'avance sur un gate frontière low-coverage.

2026-06-18 · MÉTHODE/§K · Scénario prédictif « capex hyperscaler → re-rating ENR.DE » REJETÉ au débat : (1) maillon pivot **déjà obsolète** (backlog ENR déjà €154 Md vs €50 Md de la chaîne), (2) **effet déjà pricé / non transmis** — ENR a chuté −25 % MALGRÉ commandes record + guidance relevée. → **Un scénario §K dont l'événement est très probable MAIS dont l'effet de second ordre ne se transmet pas empiriquement au prix (good-news-no-reaction) doit être rejeté.** Prédire juste un événement déjà escompté n'est pas un edge ; le test est le *delta de re-rating*, pas l'occurrence.

2026-06-18 · MÉTHODE/RANKING · 3 ★ infra-IA classés par pré-score Scout (GEV 80 > ENR 74 > CEG 72) ressortent **inversés** sur la marge de sécurité : seul CEG (le plus bas, momentum −14 %, replié −35 %) finit **Acheter** ; GEV (le plus haut, +107 %, 47x fwd) finit Surveiller. → Re-confirme 06-11 : **en SURCHAUFFE, le candidat replié bat le candidat surchauffé** ; la marge de valo (DCF inversé §C) prime sur le momentum pour ranger. Un gate 🟢 de momentum (GEV) vaut moins qu'un gate 🟠 de timing sur une qualité dé-risquée (CEG).

> Garde ~90 jours de leçons vives ici ; archive le reste sous « Archives » en bas.

## Leçons vives

2026-06-17 · HO.PA/Gate · HO.PA détenu (2.22 parts, avg_cost 246€) vient de passer 🔴 (composite -0.201, mom -12%) en repassant le recalcul signals.js ce mardi. La semaine dernière le gate était 🟠 ambre → trim discipliné exécuté. Cette semaine le momentum continue de glisser et franchit le seuil rouge. La règle §H est sans débat : sortie forcée à la prochaine fenêtre de vente (jeudi). → Ne pas attendre le vendredi pour une sortie forcée 🔴 : la latence coûte 1-2% de plus à la baisse. La fenêtre du jeudi est faite pour ça.

2026-06-17 · MÉTHODE/Scout · ENR.DE (Siemens Energy) illustre le cas "momentum 12M élevé (+91%) + RSI 30 très survendu" : le titre a beaucoup monté puis s'est corrigé brutalement. C'est une fenêtre potentielle, pas une confirmation. Le deep-dive doit vérifier que la correction est technique (prise de bénéfices, rotation) et non fondamentale (guidance coupée). → Dans ce cas, la checklist DCF inversé est encore plus importante : est-ce que le consensus €195 est réaliste compte tenu du backlog €154B et des marges attendues 10-12% ?

2026-06-16 · MÉTHODE/Tendance · Le "second ordre" d'une tendance validée (réarmement EU) peut générer une tendance distincte encore plus large (infrastructure IA/énergie) : ne pas traiter les semaines comme des cases isolées — chercher le fil conducteur causal entre les thèmes. Cette semaine : réarmement EU → industriels souverains → partage du capex avec AI infra → énergie nucléaire. C'est la même rotation macro vue sous un autre angle. → Avant d'abandonner une tendance semaine-sur-semaine, vérifier si elle a évolué ou généré un second ordre plutôt que de chercher du neuf à tout prix.

2026-06-13 · NFLX/MÉTHODE · Stop -8% obligatoire §H pour les positions 🟠 ambre non documenté en EUR explicite dans ai-fund.json → NFLX arrêté à 69.38 EUR sans seuil écrit à l'entrée (80.89 EUR). Correction : toujours écrire stop_price_eur dans exit_rule à la création de chaque position 🟠/⚪ — c'est la différence entre une règle et une intention.

2026-06-13 · MSCI/Gate · F-Score 7/9 EDGAR (couverture 49%→86%) transforme un gate 🟠 ambre en 🟢 vert juste avant l'achat. Sans le re-run signals.js ciblé, on aurait acheté sous contrainte 5% cap au lieu de 7% NAV (Moyenne). → Toujours recalculer signals.js sur les convictions candidates le vendredi avant d'ouvrir une position.

2026-06-13 · CALIBRATION/Semaine-1 · 8 décisions, hit_rate 0/8, toutes negatives — mais 7 sur 8 sont des sorties gate-forcées de positions héritées en moins-value dans un marché déclinant (benchmark -2.41%). L'alpha du book IA (~-0.3% NAV) est meilleur que celui du groupe sur la semaine grâce à la désallocation. → Le hit_rate à n<8 est du bruit ; ne pas surréagir à la calibration précoce. L'edge de l'IA c'est la discipline de sortie, pas la prédiction de direction.

2026-06-13 · RMS.PA/Confiance · Confiance Haute héritée du groupe sur une position (Hermès) sans avoir joué le débat §D : le baissier (premiums resale en baisse, expo Golfe) n'avait jamais été formalisé. → Avant de classer "Haute" une position seed héritée, refaire le débat §D. Un héritage n'est pas une validation.

2026-06-13 · NOVOB/Règle · Thèse GLP-1 la plus solide du book (Medicare juillet, 3M prescriptions) mais gate 🔴 momentum -43% force la sortie. La règle prime sans exception. Le catalyseur Medicare (1 juillet) est connu et daté → surveiller le gate NOVOB début juillet pour ré-entrée. La discipline de sortie ET la discipline de ré-entrée sont les deux faces de la même règle.

2026-06-12 · MÉTHODE/Doctor · Gate rouge basse couverture ≠ gate rouge haute couverture : NFLX était 🔴 (composite −0.612, couverture 49 %) hier, puis 🟠 (composite +0.001, couverture 92 %) aujourd'hui après incorporation EDGAR (F6/9, earnings quality vert). → Ne pas traiter un 🔴 à couverture < 50 % comme définitif : attendre les données EDGAR avant de conclure sur la qualité fondamentale. Un rouge basse couverture = « prudence technique » pas « fondamentaux cassés ».

2026-06-12 · Première fenêtre de sortie du jeudi (§H, PR #62) : 7 sorties forcées gate 🔴 exécutées en vente seule (~1 752 € net, cash 56 % NAV) sans attendre vendredi — la latence de sortie passe de ~7 j à ~3-4 j ; les arbitrages discutables (trims SAF/HO, NFLX) restent au vendredi. Sortir vite, n'acheter qu'instruit.

2026-06-11 · MÉTHODE/Scout · Pré-score Scout vs verdict Deep-dive : les 3 ★ classés par pré-score (SU 76 > MSCI 60 > MC 55) ressortent **inversés** sur la marge de sécurité — seul MSCI (le plus bas) finit **Acheter**, SU (le plus haut) finit Surveiller car payé plein (~26x). → Le pré-score Scout est **momentum-tilté** ; ne pas en faire un classement de conviction. La valo-vs-histoire (DCF inversé §C) doit primer sur le momentum pour ranger les candidats qualité.

2026-06-11 · MÉTHODE/Gate · Un gate 🟠 n'est pas un défaut de qualité : MSCI ambre +0,198 est tiré par 1 signal d'initié (1 achat/2 ventes, échantillon minuscule) + momentum mou, pas par les fondamentaux (organique +13 %, rétention 95 %). → Lire les `contributions` du gate avant de pénaliser la conviction ; distinguer « ambre de timing » d'« ambre de qualité ».

2026-06-12 · NOVOB-SAP/Tension · Divergence fondamentaux vs gate : NOVOB (Wegovy 3M prescriptions, Medicare dès 1er juillet) et SAP (cloud +19 %, backlog +20 %) ont des thèses CONFIRMÉES mais gates 🔴 sur momentum. La méthode §H exige la sortie book IA sans débat. → Tenir la règle verrouillée même quand ça fait mal : l'IA re-entrera quand le gate se redresse. La discipline de règle est l'edge, pas la flexibilité.

2026-06-12 · MSTR/Leçon · La thèse « proxy bitcoin à prime » contient un double risque caché : baisse BTC ET compression de la prime de holding simultanées. F3/9, EPS −149 %, momentum −51 % = tous les signaux s'accumulent. → Un proxy avec levier (dette pour acheter BTC) se casse plus vite qu'il ne monte ; la règle de sortie « prime NAV s'effondre » était correcte mais aurait dû déclencher la sortie plus tôt (threshold explicite sur la prime manquant au départ).

## Archives

(rien encore)
