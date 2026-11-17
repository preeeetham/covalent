import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Terms of use" };

export default function Terms() {
  return (
    <LegalPage title="Terms of use" updated="17 November 2026">
      <h2>Who can use Covalent</h2>
      <ul>
        <li>You must be at least 18 years old.</li>
        <li>One account per person. Your profile must be about you, with your own photos.</li>
        <li>You're responsible for keeping your login safe.</li>
      </ul>
      <h2>How Covalent works</h2>
      <p>
        You get a small daily batch of suggested people. You can start a "reaction" (a bond) with someone, play rounds together, and plan a date. Bonds that go quiet for
        72 hours close automatically. We may limit how many active bonds you have.
      </p>
      <h2>Payments</h2>
      <ul>
        <li><strong>Date commitment (₹99):</strong> paid by each person to confirm a date. At partner venues it is redeemable as ₹99 off your bill. If a date is cancelled before it happens, commitments are refunded. If you don't show up, your commitment is forfeited.</li>
        <li><strong>Catalysts:</strong> optional one-off purchases for small extras. Non-refundable once used.</li>
        <li>In this demo build, payments run in test mode and no real money moves.</li>
      </ul>
      <h2>Meeting in person</h2>
      <p>
        Covalent suggests public venues and gives you safety tools, but we don't run background checks beyond identity verification and we aren't present at your date.
        Use your judgement, meet in public, and tell a friend. You are responsible for your own conduct offline.
      </p>
      <h2>Your content</h2>
      <p>You own what you post. You give us a licence to display it within Covalent to run the service. We remove content that breaks the Community Guidelines.</p>
      <h2>Ending things</h2>
      <p>You can delete your account any time. We may suspend accounts that break these terms or the guidelines, especially for safety reasons.</p>
      <h2>Intermediary status</h2>
      <p>Covalent is an intermediary under the Information Technology Act, 2000 and follows the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, including the grievance mechanism on our Safety page.</p>
    </LegalPage>
  );
}
