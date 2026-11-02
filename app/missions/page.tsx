import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/ui";
import { MissionCenter } from "@/components/missions/missions";

export const metadata: Metadata = {
  title: "Mission Center",
  description:
    "Sixteen space missions from Apollo 11 to Europa Clipper — status, key facts and imagery, all verified against NASA mission pages.",
};

export default function MissionsPage() {
  return (
    <PageShell className="pt-28 pb-24">
      <SectionHeader
        index="07 · Mission Center"
        title="The mission files"
        sub="Every spacecraft on this wall is real, with launch dates, outcomes and status verified against NASA mission pages. Filter by state, open a mission file, or walk the timeline."
      />
      <MissionCenter />
    </PageShell>
  );
}
