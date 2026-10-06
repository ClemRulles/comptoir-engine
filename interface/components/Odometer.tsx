// Odometer — montant à rouleaux : chaque chiffre est une colonne 0-9 qui glisse jusqu'à sa
// valeur. Rendu serveur = valeur finale (jamais de « 0 € » le temps que le JS charge) ; le
// défilement d'arrivée est une animation CSS pure (rapide sur mobile, sans hydratation à risque).
// Quand la valeur change (survol de la courbe), les colonnes glissent par transition.
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function Odometer({
  text,
  className = "",
  animateIn = true,
}: {
  text: string; // valeur déjà formatée (ex. « 10 869 € »)
  className?: string;
  animateIn?: boolean;
}) {
  let digitIndex = 0;
  return (
    <span className={`odometer inline-flex items-baseline tabular-nums ${className}`} aria-label={text} role="text">
      {Array.from(text).map((ch, i) => {
        if (!/[0-9]/.test(ch)) {
          return (
            <span key={`s${i}`} aria-hidden className="odo-static">
              {ch}
            </span>
          );
        }
        const d = Number(ch);
        const k = digitIndex++;
        return (
          <span key={`d${i}`} aria-hidden className="odo-col">
            <span
              className={`odo-strip ${animateIn ? "odo-in" : ""}`}
              style={{ ["--to" as string]: `${-d * 10}%`, animationDelay: `${k * 55}ms`, transform: `translateY(${-d * 10}%)` }}
            >
              {DIGITS.map((x) => (
                <span key={x} className="odo-digit">
                  {x}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
