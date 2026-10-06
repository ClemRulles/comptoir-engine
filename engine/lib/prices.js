// prices.js — cours en EUROS pour valoriser le book (le book est en €, les titres
// cotent en USD/GBp/HKD…). Réutilise le cache signals.json quand il a le prix, sinon
// Yahoo (gratuit, sans clé). Ne jette jamais : null = data_gap noté par l'appelant.
import { yahooDaily } from "./sources.js";

const fx = new Map();

// Nombre d'euros pour 1 unité de `ccy` (ex. USD → ~0,87). GBp = pence (1/100 GBP).
export async function eurPerUnit(ccy) {
  if (!ccy || ccy === "EUR") return 1;
  if (ccy === "GBp" || ccy === "GBX") {
    const gbp = await eurPerUnit("GBP");
    return gbp == null ? null : gbp / 100;
  }
  const key = ccy.toUpperCase();
  if (!fx.has(key)) {
    const y = await yahooDaily(`EUR${key}=X`); // cours = unités de ccy pour 1 €
    fx.set(key, y?.price > 0 ? 1 / y.price : null);
  }
  return fx.get(key);
}

// { price_native, currency, price_eur, source } ou null.
export async function priceEUR(ticker, signals) {
  const s = signals?.tickers?.[ticker];
  let price = s?.price, currency = s?.currency, source = "signals.json";
  if (!(price > 0) || !currency) {
    const y = await yahooDaily(ticker);
    price = y?.price;
    currency = y?.currency;
    source = "yahoo";
  }
  if (!(price > 0)) return null;
  const rate = await eurPerUnit(currency || "EUR");
  if (rate == null) return null;
  return { price_native: price, currency: currency || "EUR", price_eur: Math.round(price * rate * 10000) / 10000, source };
}
