# Comptoir — Interface (Groupe vs IA)

Petite app web (Next.js) pour le groupe : suit le **fonds commun réel** et le **fonds fictif
géré par l'IA**, et compare leurs performances. **100 % fictif — aucun ordre réel n'est passé.**

## Pile
- Next.js (App Router) + Tailwind, déployé sur **Vercel**
- **Supabase** : connexion par email (Auth) + base de données (Postgres)
- Prix de marché via **FMP** (repli **Finnhub**)
- Le book de l'IA est lu depuis le repo (`memory/fund/ai-fund.json`), écrit par la routine du vendredi

---

## Déploiement (≈ 15 min) — à faire par toi

> Je (Claude) n'ai jamais accès à tes comptes ni à tes secrets. Tu crées les comptes et
> tu colles les clés toi-même dans Vercel — jamais dans le chat.

### 1. Supabase
1. Crée un projet sur https://supabase.com (gratuit).
2. **SQL Editor** → colle le contenu de `interface/supabase/migration.sql` → **Run**.
3. **Authentication → Providers** : laisse « Email » activé (lien magique).
4. **Authentication → URL Configuration** : ajoute l'URL Vercel (ex.
   `https://comptoir.vercel.app`) dans *Site URL* et *Redirect URLs* (`.../auth/callback`).
5. Invite les membres : **Authentication → Users → Add user** (un par email du groupe).
6. Récupère dans **Project Settings → API** : `Project URL`, `anon key`, `service_role key`.

### 2. Token GitHub (lecture du book IA dans le repo privé)
- Crée un **fine-grained token** (https://github.com/settings/tokens) limité au repo
  `comptoir-engine`, permission **Contents: Read-only**.

### 3. Vercel
1. https://vercel.com → **Add New → Project** → importe le repo `comptoir-engine`.
2. **Root Directory = `interface`**.
3. **Environment Variables** (copie depuis `.env.example`) :
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `FMP_API_KEY` et/ou `FINNHUB_API_KEY`
   - `GITHUB_TOKEN`, `GITHUB_REPO=ClemRulles/comptoir-engine`, `GITHUB_BRANCH=claude/memory`
   - `CRON_SECRET` (une longue chaîne aléatoire)
4. **Deploy**. Le cron quotidien (`vercel.json`) valorisera les fonds chaque soir.

### 4. Ajuste le capital de départ
Le seed met 1000 € par défaut. Mets le **pot commun réel** dans Supabase :
```sql
update funds set start_capital = <montant>, cash = <montant>;  -- group
-- puis ajuste memory/fund/ai-fund.json (start_capital + cash) au même montant
```

---

## Développement local
```bash
cd interface
npm install
cp .env.example .env.local   # remplis les valeurs
npm run dev                  # http://localhost:3000
```
Tester la valorisation à la main :
```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/value
```

## Pages
- `/` tableau de bord (2 courbes Groupe vs IA + brief de la semaine)
- `/groupe` saisie des positions du fonds commun
- `/ia` book fictif de l'IA (lecture seule)
- `/brief` brief & tendance hebdo (rendus depuis `memory/`)

## Note de sécurité
Aucune clé n'est commitée. Tout secret vit dans les variables d'environnement Vercel.
L'app n'exécute jamais d'ordre réel : c'est un suivi/comparaison de performances fictives.
