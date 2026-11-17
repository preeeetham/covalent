import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Community guidelines" };

export default function Guidelines() {
  return (
    <LegalPage title="Community guidelines" updated="17 November 2026">
      <p>Covalent works because people show up as themselves and treat each other well. These are the rules. Breaking them gets you removed.</p>
      <h2>Be real</h2>
      <ul>
        <li>Your own name, your own photos, your real age.</li>
        <li>No impersonation, no catfishing, no fake profiles.</li>
      </ul>
      <h2>Be kind</h2>
      <ul>
        <li>No harassment, hate speech or slurs — including about caste, religion, region, gender, sexuality, skin colour or body.</li>
        <li>"No" means no. Stop when someone isn't interested. Dissolving a bond is a normal, respected choice here.</li>
        <li>No unsolicited sexual content.</li>
      </ul>
      <h2>Be safe</h2>
      <ul>
        <li>Never ask for money, gifts, UPI transfers, OTPs or investment "opportunities".</li>
        <li>First dates happen in public places.</li>
        <li>Don't share someone else's details or photos without consent.</li>
      </ul>
      <h2>Show up</h2>
      <p>If you commit to a date, go — or cancel in good time. No-shows lose their commitment and their reliability score.</p>
      <h2>Report, don't retaliate</h2>
      <p>Use Report on any profile or bond. Reports are confidential and every one is reviewed.</p>
    </LegalPage>
  );
}
