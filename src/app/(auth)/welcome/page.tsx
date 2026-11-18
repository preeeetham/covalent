import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";
import { WelcomeForm } from "@/components/auth/welcome-form";

export const metadata: Metadata = { title: "Almost there" };

/** Where Google / GitHub sign-ups land the first time: 18+ check and consents, then onboarding. */
export default async function WelcomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub as string | undefined;
  if (!id) redirect("/login");
  const { data: profile } = await admin().from("profiles").select("id").eq("id", id).maybeSingle();
  if (profile) redirect("/today");
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Almost there.</h1>
      <p className="mt-2 text-ink-2">
        {email ? (
          <>
            Signed in as <strong className="text-ink">{email}</strong>.{" "}
          </>
        ) : null}
        Two quick things before you find your element.
      </p>
      <WelcomeForm />
    </div>
  );
}
