import { redirect } from "next/navigation";

export default function LegacyCrmPage() {
  redirect("/internal/crm");
}
