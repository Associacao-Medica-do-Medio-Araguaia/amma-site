import { redirect } from "next/navigation";

// A Localização deixou de ser uma aba própria e passa a viver em /contato (design 1c).
export default function LocalizacaoPage() {
  redirect("/contato");
}
