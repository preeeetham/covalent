import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Safety & grievances" };

export default function Safety() {
  return (
    <LegalPage title="Safety & grievances" updated="17 November 2026">
      <h2>Built in, not bolted on</h2>
      <ul>
        <li><strong>Verified profiles</strong> through eLitmus identity.</li>
        <li><strong>Server-side photo blur</strong> — nobody can un-blur you early.</li>
        <li><strong>Contact-detail warnings</strong> if someone shares a number, UPI ID or handle before you've met.</li>
        <li><strong>Public venues only</strong> for planned first dates.</li>
        <li><strong>Share your plan</strong> with a trusted friend in one tap.</li>
        <li><strong>Private post-date feedback.</strong> "I didn't feel safe" goes straight to our safety team.</li>
        <li><strong>Report and block</strong> from every profile, bond and chat. Blocking is instant and mutual.</li>
      </ul>
      <h2>Before your first date</h2>
      <ul>
        <li>Meet in public, and get there and back on your own.</li>
        <li>Tell a friend where you'll be (use Share plan).</li>
        <li>Keep your drink in sight. Leave whenever you want.</li>
        <li>Never send money, OTPs or documents to someone you've met online.</li>
      </ul>
      <h2>In an emergency</h2>
      <p>
        Call <strong>112</strong> (national emergency) or <strong>1091</strong> (women's helpline). Cyber fraud: <strong>1930</strong> or cybercrime.gov.in.
      </p>
      <h2>Grievance officer</h2>
      <p>
        Under the IT Rules, 2021 and the DPDP Act, 2023 you can raise a complaint with our grievance officer. We acknowledge within 24 hours and resolve within 15 days.
      </p>
      <p>
        <strong>Grievance Officer, Covalent</strong> (demo placeholder)
        <br />
        grievance@covalent.test
      </p>
    </LegalPage>
  );
}
