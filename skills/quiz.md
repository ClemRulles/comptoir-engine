# Skill — le quiz du jour (`memory/fund/quiz.json`)

Une question par jour, posée sur l'accueil de l'app, pour que les membres **apprennent la bourse**
en 30 secondes et aient une raison de revenir. Un classement mensuel (page Groupe) compte les
bonnes réponses. Le quiz n'a **aucun lien** avec les décisions du book : c'est de la pédagogie.

## Quand
**Chaque routine de nuit**, juste avant son commit : vérifie que les **2 prochains jours** (date de
Paris) ont leur question et écris celles qui manquent. Le vendredi couvre ainsi samedi et dimanche.
**Ne modifie jamais** une question dont la date est aujourd'hui ou passée : des membres y ont
peut-être déjà répondu. Garde ~60 jours (retire les plus anciennes), les plus récentes en dernier.

## Le thème suit le jour de la question
| Jour | Thème | Exemple |
|---|---|---|
| Lun | `bases` | Que mesure le PER ? Qu'est-ce qu'un ETF ? |
| Mar | `histoire` | 1929, 1987, bulle internet, 2008, Covid… |
| Mer | `nos-lignes` | Un fait sur une entreprise détenue (groupe ou book IA) |
| Jeu | `actualite` | Un fait de la semaine **déjà sourcé** dans `news.json` ou `catalysts.md` |
| Ven | `psychologie` | Biais d'aversion à la perte, effet de mode, ancrage… |
| Sam | `crypto` ou `fiscalite` | Halving, plafond du PEA… |
| Dim | `histoire` ou `bases`, au choix | une question « culture » |

Niveau (`level`) : surtout `facile` et `moyen`, un `difficile` par semaine au plus.

## Règles (non négociables)
- **Aucun chiffre inventé.** Chaque fait vient d'une source vérifiée dans ce run (recherche web,
  SEC, FRED, rapport de l'entreprise, AMF, Banque de France…) et figure dans `source`. Un fait
  d'actualité ne sort que de `news.json` ou `catalysts.md`, déjà sourcés. Dans le doute, choisis
  une question de `bases` : c'est toujours possible honnêtement.
- **Une seule bonne réponse, sans ambiguïté.** Les trois autres sont plausibles pour un débutant
  mais clairement fausses pour qui connaît. Pas de piège, pas de « toutes les réponses ».
- **Varie la position** de la bonne réponse (`answer` 0 à 3), sans motif prévisible.
- **Pas de répétition** : relis les 60 jours du fichier avant d'écrire.
- **Jamais un conseil** (« faut-il acheter X ? ») ni une prédiction de cours.
- **Français simple, zéro jargon interne** (pas de §, P-00N, gate, saisine, hystérésis).
- Longueurs : `question` ≤ 160 caractères, chaque réponse ≤ 60, `explanation` ≤ 300 (pourquoi
  c'est juste et ce qu'il faut en retenir, en une ou deux phrases).

## Format d'une entrée
```json
{
  "date": "2026-10-12",
  "theme": "bases",
  "level": "facile",
  "question": "Un ETF « MSCI World », c'est…",
  "choices": [
    "Une action d'une seule entreprise mondiale",
    "Un fonds coté qui réplique ~1 400 grandes entreprises de pays développés",
    "Un compte d'épargne garanti",
    "Une obligation d'État"
  ],
  "answer": 1,
  "explanation": "Un ETF est un fonds coté en bourse qui suit un indice. Le MSCI World regroupe environ 1 400 grandes et moyennes entreprises de 23 pays développés : une seule ligne, une large diversification.",
  "source": { "name": "MSCI — fiche de l'indice MSCI World" }
}
```

Le garde-fou (`node engine/guard.js`) retire toute entrée malformée (pas exactement 4 réponses,
`answer` hors 0-3, réponses en double, date en double) : elle ne s'affichera pas. Sans question pour
une date, l'app pioche dans sa propre réserve : une routine ratée ne laisse jamais l'accueil vide.
