// Squelette affiché INSTANTANÉMENT au changement d'onglet, le temps que le serveur réunisse les
// données (GitHub, Supabase, cours). Sans lui, un tap semblait ne rien faire pendant 1-2 s.
export default function Loading() {
  return (
    <div className="flex flex-col gap-5 md:gap-6" aria-busy="true" aria-label="Chargement">
      <div className="rounded-[28px] border border-line/70 bg-card p-5 md:p-8">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton mt-4 h-12 w-56 md:h-16 md:w-80" />
        <div className="skeleton mt-4 h-6 w-44 rounded-full" />
        <div className="skeleton mt-6 h-[180px] w-full rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="card p-5 md:p-6">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton mt-4 h-3 w-full" />
            <div className="skeleton mt-2 h-3 w-5/6" />
            <div className="skeleton mt-2 h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
