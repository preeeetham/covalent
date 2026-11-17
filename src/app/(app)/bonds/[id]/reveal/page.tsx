import { notFound, redirect } from "next/navigation";
import { requireViewer } from "@/lib/auth";
import { getBondDetail, tickPersona } from "@/lib/data/bonds";
import { RevealMoment } from "@/components/bond/reveal-moment";
import { BondLive } from "@/components/bond/bond-live";
import { WaitingCard } from "@/components/rounds/shared";

export default async function RevealPage(props: PageProps<"/bonds/[id]/reveal">) {
  const { id } = await props.params;
  const viewer = await requireViewer();
  let detail = await getBondDetail(viewer, id);
  if (!detail) notFound();
  if (detail.partner.is_demo && detail.bond.status === "active" && (await tickPersona(id, true))) detail = (await getBondDetail(viewer, id))!;
  const { bond, partner } = detail;
  if (bond.round < 4) redirect(`/bonds/${id}`);

  if (bond.status !== "revealed") {
    return (
      <div className="px-5 pt-16">
        <BondLive bondId={id} personaDueAt={null} />
        <WaitingCard partnerName={partner.first_name} text={`You've tapped reveal. As soon as ${partner.first_name} does too, you'll both see each other — at the same moment.`} />
      </div>
    );
  }

  return (
    <RevealMoment
      bondId={id}
      partnerName={partner.first_name}
      photoId={partner.photoIds[0] ?? null}
      chemistry={bond.chemistry}
      line={partner.prompts[0]?.answer ?? null}
    />
  );
}
