// nav.ts — une seule définition de la navigation (sidebar desktop, barre mobile, titres).
import { Bot, Globe2, GraduationCap, Home, MessageCircle, Search, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  short: string;
  title: string;
  icon: LucideIcon;
  mobile: boolean;
}

export const NAV: NavItem[] = [
  { href: "/", label: "Accueil", short: "Accueil", title: "Accueil", icon: Home, mobile: true },
  { href: "/ia", label: "Fonds IA", short: "IA", title: "Fonds IA", icon: Bot, mobile: true },
  { href: "/monde", label: "Le monde", short: "Monde", title: "Le monde", icon: Globe2, mobile: true },
  { href: "/groupe", label: "Fonds du groupe", short: "Groupe", title: "Fonds du groupe", icon: Users, mobile: true },
  { href: "/apprentissages", label: "Apprentissages", short: "Appris", title: "Ce que l'IA a appris", icon: GraduationCap, mobile: false },
  { href: "/recherche", label: "Recherche", short: "Recherche", title: "Recherche", icon: Search, mobile: false },
  { href: "/propositions", label: "Chat du groupe", short: "Chat", title: "Chat du groupe", icon: MessageCircle, mobile: true },
];

export const isActive = (href: string, pathname: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

export function titleFor(pathname: string): string {
  if (pathname.startsWith("/indicateurs")) return "Le monde";
  return NAV.find((n) => isActive(n.href, pathname))?.title ?? "HypeInvest";
}
