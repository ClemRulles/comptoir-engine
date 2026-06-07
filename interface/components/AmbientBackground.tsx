// Fond ambiant global : deux halos de marque très diffus + trame de points discrète.
// Sobre et fixe (légère dérive). Purement décoratif → aria-hidden, sans interaction.
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-brand/[0.07] blur-[130px] animate-drift-slow dark:bg-brand/[0.12]" />
      <div className="absolute -right-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#0d9488]/[0.06] blur-[130px] animate-drift-slow [animation-delay:6s] dark:bg-[#0d9488]/[0.11]" />
      <div className="absolute bottom-[-12rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-ai/[0.05] blur-[140px] animate-drift-slow [animation-delay:12s] dark:bg-ai/[0.08]" />
      <div className="absolute inset-0 dot-grid opacity-[0.45] dark:opacity-[0.20]" />
    </div>
  );
}
