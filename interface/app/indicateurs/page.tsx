import { redirect } from "next/navigation";

// « Indicateurs » est devenu « Le monde » (actualité, pros, régime, signaux).
export default function IndicateursPage() {
  redirect("/monde");
}
