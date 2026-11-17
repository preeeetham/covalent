import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy notice" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy notice" updated="17 November 2026">
      <p>
        This notice explains, in plain language, what Covalent collects, why, and what you can do about it. It is written to meet the notice requirements of India's
        Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025.
      </p>
      <h2>Who we are</h2>
      <p>Covalent is a dating service operated by the eLitmus group (the "Data Fiduciary"). Questions go to our grievance officer (see Safety).</p>

      <h2>The data firewall</h2>
      <p>
        <strong>Your Covalent data is never shared with eLitmus recruiters, hiring partners or employers.</strong> eLitmus collected your assessment data for hiring.
        We do not reuse it for dating. The only thing that crosses from eLitmus to Covalent, and only with your opt-in, is a yes/no that your identity and education
        have been verified. Nothing crosses back.
      </p>

      <h2>What we collect, and why</h2>
      <ul>
        <li><strong>Account:</strong> email, password (hashed by our auth provider), date of birth — to run your account and keep Covalent 18+.</li>
        <li><strong>Profile:</strong> first name, gender, who you'd like to meet, city, role, optional company type and hometown, intent, interests, prompt answers, photos — to show you to potential matches.</li>
        <li><strong>Values quiz:</strong> your answers — to compute compatibility. Never shown to other people.</li>
        <li><strong>Activity:</strong> reactions, round answers, chat messages, date plans and feedback — to run the product and keep it safe.</li>
        <li><strong>Payments:</strong> amounts and status only. Card or UPI details are handled by the payment provider and never stored by us.</li>
        <li><strong>Safety:</strong> reports and blocks — to protect people.</li>
      </ul>

      <h2>What we deliberately don't collect</h2>
      <ul>
        <li>No caste field, ever. Religion appears only as an optional values question, never as a filter.</li>
        <li>No precise location. City only.</li>
        <li>No phone contacts, no social media scraping.</li>
        <li>Photo metadata (including GPS) is stripped when you upload.</li>
      </ul>

      <h2>Who sees what</h2>
      <ul>
        <li>People in your batch see your profile with a heavily blurred photo. Photos sharpen only as you both complete rounds together.</li>
        <li>Your round answers are shown to your partner only after you've both answered.</li>
        <li>Our safety team may view reported content to investigate.</li>
      </ul>

      <h2>Your rights</h2>
      <ul>
        <li><strong>Access & portability:</strong> download everything from Settings → Download my data.</li>
        <li><strong>Correction:</strong> edit your profile any time.</li>
        <li><strong>Erasure:</strong> Settings → Delete my account permanently removes your profile, photos, answers and messages.</li>
        <li><strong>Withdraw consent:</strong> deleting your account withdraws it. Marketing consent can be withdrawn separately.</li>
        <li><strong>Grievance:</strong> contact our grievance officer; you may also approach the Data Protection Board of India.</li>
      </ul>

      <h2>Retention</h2>
      <p>We keep your data while your account is active. After deletion, backups roll off within 30 days. Safety reports about serious harm may be kept longer where the law requires.</p>

      <h2>Breaches</h2>
      <p>If a personal-data breach happens, we will notify affected users and the Data Protection Board within the timelines set by the DPDP Rules.</p>

      <h2>Children</h2>
      <p>Covalent is only for adults (18+). We block sign-ups with an under-18 date of birth and act on any report that a user may be under 18.</p>
    </LegalPage>
  );
}
