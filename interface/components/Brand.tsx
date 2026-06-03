export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <linearGradient id="hi-grad" x1="0" y1="40" x2="40" y2="0">
          <stop offset="0%" stopColor="#84cc16" />
          <stop offset="55%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      {/* barres */}
      <rect x="6" y="22" width="5" height="11" rx="1.5" fill="url(#hi-grad)" />
      <rect x="14" y="16" width="5" height="17" rx="1.5" fill="url(#hi-grad)" />
      <rect x="22" y="24" width="5" height="9" rx="1.5" fill="url(#hi-grad)" opacity="0.85" />
      {/* flèche montante */}
      <path
        d="M6 27 C 14 25, 22 20, 33 9"
        stroke="url(#hi-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M27 8 L34 7 L33 14 Z" fill="#16a34a" />
    </svg>
  );
}

export function Brand({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark size={size} />
      <span className="text-lg font-extrabold tracking-tight">
        <span className="text-brand">Hype</span>
        <span className="text-ink">Invest</span>
      </span>
    </div>
  );
}
