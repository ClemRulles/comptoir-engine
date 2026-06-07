import { redirect } from "next/navigation";

// Le Brief & Tendance vit désormais en bas de la page Apprentissages.
export default function BriefPage() {
  redirect("/apprentissages");
}
