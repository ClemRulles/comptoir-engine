"use client";

import { useState } from "react";

// Ticker de l'app → domaine de l'entreprise (pour récupérer le logo).
// Couvre les 15 positions du book + les valeurs courantes susceptibles d'être proposées.
// Tout ticker absent retombe sur un monogramme coloré (jamais d'image cassée).
const LOGO_DOMAINS: Record<string, string> = {
  // Book du groupe / IA
  "SAF.PA": "safran-group.com",
  "HO.PA": "thalesgroup.com",
  AMZN: "amazon.com",
  NFLX: "netflix.com",
  EIMI: "ishares.com",
  AI: "airliquide.com",
  LOTB: "lotusbakeries.com",
  BYD: "byd.com",
  CI2: "amundi.com",
  "BNP.PA": "bnpparibas.com",
  "SGO.PA": "saint-gobain.com",
  SAP: "sap.com",
  NOVOB: "novonordisk.com",
  MSTR: "microstrategy.com",
  "RMS.PA": "hermes.com",
  // Valeurs courantes (propositions / mouvements)
  NVDA: "nvidia.com",
  ASML: "asml.com",
  CEG: "constellationenergy.com",
  AAPL: "apple.com",
  MSFT: "microsoft.com",
  GOOGL: "abc.xyz",
  GOOG: "abc.xyz",
  META: "meta.com",
  TSLA: "tesla.com",
  AMD: "amd.com",
  TSM: "tsmc.com",
  VRT: "vertiv.com",
  AVGO: "broadcom.com",
  COST: "costco.com",
  V: "visa.com",
  MA: "mastercard.com",
  JPM: "jpmorganchase.com",
  KO: "coca-cola.com",
  DIS: "disney.com",
  NKE: "nike.com",
};

// Palette douce et déterministe pour le monogramme de repli.
const MONO = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-600",
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Paire crypto Yahoo (BTC-EUR, ETH-USD…) → symbole de base pour l'icône (btc, eth…).
const CRYPTO_RE = /^([A-Z0-9]{2,6})-(EUR|USD|USDT|USDC|BTC)$/;

export function TickerLogo({
  ticker,
  size = 24,
  className = "",
  kind,
}: {
  ticker: string;
  size?: number;
  className?: string;
  kind?: "equity" | "etf" | "crypto" | string;
}) {
  const base = (ticker || "").toUpperCase();
  const cryptoMatch = base.match(CRYPTO_RE);
  const isCrypto = kind === "crypto" || !!cryptoMatch;
  const domain = LOGO_DOMAINS[base];

  // Logo par ticker (FMP) — couvre AUTOMATIQUEMENT tout nouveau titre acheté
  // (US comme européen), sans avoir à compléter la map à la main.
  const fmp = `https://financialmodelingprep.com/image-stock/${encodeURIComponent(base)}.png`;

  // Chaîne de repli :
  //  - Crypto → jeu d'icônes statique gratuit (cryptocurrency-icons via jsDelivr), par symbole.
  //  - Ticker curaté (map domaine) → DuckDuckGo → favicon Google  (logo garanti correct,
  //    y compris pour les tickers ambigus type « AI » = Air Liquide ≠ C3.ai)
  //  - Ticker inconnu → FMP par ticker (logo réel auto)
  //  - Dans tous les cas, repli final sur le monogramme (jamais d'image cassée).
  const cryptoSym = (cryptoMatch?.[1] ?? base.split("-")[0]).toLowerCase();
  const sources = isCrypto
    ? [
        `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${cryptoSym}.png`,
        `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/generic.png`,
      ]
    : domain
    ? [
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `https://www.google.com/s2/favicons?sz=64&domain=${domain}`,
      ]
    : [fmp];
  const [attempt, setAttempt] = useState(0);
  const src = sources[attempt];

  const initials = base.split(".")[0].slice(0, 3) || "?";
  const mono = MONO[hashStr(base) % MONO.length];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-line/70 ${
        src ? "bg-white" : `${mono} text-white`
      } ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          onError={() => setAttempt((a) => a + 1)}
          className="h-full w-full object-contain p-[2px]"
        />
      ) : (
        <span className="font-bold leading-none" style={{ fontSize: Math.max(8, size * 0.34) }}>
          {initials}
        </span>
      )}
    </span>
  );
}
