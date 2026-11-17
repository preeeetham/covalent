import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Download, FileText, LogOut, Shield, Scale, Users, Sparkles } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { admin } from "@/lib/supabase/admin";
import { ProfileForm } from "@/components/you/profile-form";
import { ThemeToggle } from "@/components/you/theme-toggle";
import { BlockedList } from "@/components/you/blocked-list";
import { DeleteAccount } from "@/components/you/delete-account";
import { logOut } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const v = await requireViewer();
  const { data: blocks } = await admin().from("blocks").select("blocked_id").eq("blocker_id", v.id);
  const ids = (blocks ?? []).map((b) => b.blocked_id);
  const { data: people } = ids.length ? await admin().from("profiles").select("id, first_name").in("id", ids) : { data: [] };

  return (
    <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-6 flex items-center gap-2">
        <Link href="/you" className="-ml-2 grid size-11 place-items-center rounded-full text-ink hover:bg-surface-2" aria-label="Back">
          <ChevronLeft className="size-6" />
        </Link>
        <h1 className="font-display text-3xl text-ink">Settings</h1>
      </header>

      <Section title="Profile">
        <ProfileForm
          initial={{
            first_name: v.first_name ?? "",
            city: v.city ?? "Bengaluru",
            hometown: v.hometown ?? "",
            role: v.role ?? "",
            company: v.company ?? "",
            intent: (v.intent ?? "see") as "serious" | "see" | "friends",
            interested_in: v.interested_in as ("woman" | "man" | "nonbinary" | "everyone")[],
          }}
        />
      </Section>

      <Section title="Appearance">
        <ThemeToggle />
      </Section>

      <Section title="Covalent+">
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-line p-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-bond" />
          <div>
            <p className="font-semibold text-ink">Coming later · ₹149/month</p>
            <p className="text-sm text-ink-2">Advanced filters, see who invited you first, priority support. The core product stays free forever.</p>
          </div>
        </div>
      </Section>

      <Section title="Privacy & safety">
        <BlockedList people={(people ?? []).map((p) => ({ id: p.id, name: p.first_name ?? "Someone" }))} />
        <a href="/api/export" className="mt-3 flex min-h-[48px] items-center gap-3 rounded-2xl border border-line bg-surface px-4 font-medium text-ink">
          <Download className="size-4 text-ink-2" /> Download my data (JSON)
        </a>
        <p className="mt-2 text-xs text-ink-3">
          Your Covalent data never reaches eLitmus recruiters or employers. Only your verification status crosses over, and only because you opted in.
        </p>
      </Section>

      <Section title="Legal">
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {[
            { href: "/privacy", label: "Privacy notice", icon: Shield },
            { href: "/terms", label: "Terms of use", icon: FileText },
            { href: "/guidelines", label: "Community guidelines", icon: Users },
            { href: "/safety", label: "Safety & grievance officer", icon: Scale },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex min-h-[48px] items-center gap-3 px-4 text-ink hover:bg-surface-2">
              <l.icon className="size-4 text-ink-2" /> {l.label}
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Account">
        <form action={logOut}>
          <button className="flex min-h-[48px] w-full items-center gap-3 rounded-2xl border border-line bg-surface px-4 font-medium text-ink">
            <LogOut className="size-4 text-ink-2" /> Log out
          </button>
        </form>
        <DeleteAccount />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-3">{title}</h2>
      {children}
    </section>
  );
}
