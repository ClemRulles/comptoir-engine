"use client";

import { useEffect, useRef, useState } from "react";
import { eur, pct } from "@/lib/fund";

type Kind = "eur" | "pct" | "plain";

function format(n: number, kind: Kind) {
  if (kind === "eur") return eur(n);
  if (kind === "pct") return pct(n);
  return n.toLocaleString("fr-FR");
}

export function AnimatedNumber({
  value,
  kind = "plain",
  duration = 900,
}: {
  value: number;
  kind?: Kind;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const from = 0;
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            setDisplay(from + (value - from) * eased);
            if (t < 1) requestAnimationFrame(tick);
            else setDisplay(value);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  return <span ref={ref} className="tabular-nums">{format(display, kind)}</span>;
}
