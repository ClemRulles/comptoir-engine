# HypeInvest — Roadmap & idées (à garder)

Idées validées à implémenter plus tard. Cocher au fur et à mesure.

## 🧠 L'IA apprend de son passé (priorité « plus tard »)
But : que le fonds IA **retienne ses erreurs et ses réussites** pour orienter ses prochaines
décisions et conseils.
- À chaque vendredi, la routine **revoit les trades clôturés** du book IA (`memory/fund/ai-fund.json`)
  et calcule leur **P&L réalisé** + si la thèse s'est confirmée/cassée.
- Écrit des **leçons datées** dans `memory/lessons.md` (déjà prévu par CLAUDE.md) : ce qui a marché,
  ce qui a raté, pourquoi (catalyseur absent, valorisation tendue, momentum suivi trop tard…).
- **Boucle de calibration** : suivre le taux de réussite par niveau de confiance (Haute/Moyenne/Basse)
  et par type de thèse ; ajuster la taille des positions et le ton des conseils en conséquence.
- Le **brief du vendredi** cite explicitement « leçon de la semaine » et « ce que je corrige ».
- Affichage interface : page/onglet « Apprentissages de l'IA » (timeline des leçons + hit-rate,
  courbe de calibration confiance vs résultat).

## 🔔 Proposition d'investissement + notifications
- Chaque membre peut **proposer un investissement** depuis l'interface (ticker, thèse, taille).
- **Notification à tout le monde** (email + in-app), avec possibilité de **voter / commenter**.
- Table `proposals` (auteur, ticker, thèse, statut, votes) + `notifications`.

## ⚡ Données live / réactivité
- **Auto-refresh** des cours en heures de marché (toutes ~1–2 min, uniquement onglet visible).
- Bouton « Rafraîchir » + indicateur « mis à jour il y a X ».
- Plus tard : flux temps réel (websocket) si un fournisseur le permet dans le quota.

## 💶 Apports mensuels (25 €/mois/personne)
- Injection automatique le 1er du mois dans les 2 fonds (cash +montant), historisée dans `contributions`.
- Réglage du montant + nombre de membres dans `settings`.

## 📊 Métriques avancées
- Drawdown max, performance annualisée, volatilité, ratio de Sharpe, win rate.
- Comparaison vs un indice de référence (ex. S&P 500 / MSCI World).

## 🎨 Confort & finitions
- Mode sombre (toggle), polish mobile, raccourcis clavier.
- Export PDF du brief hebdo ; page « historique des briefs ».
- ✅ Logo + favicon HypeInvest (fait).
- ✅ Sélecteur de période 1J/1S/1M/3M/1A/Max + animations (fait).
