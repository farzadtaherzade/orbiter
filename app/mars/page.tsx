import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/ui";
import { MarsExplorer } from "@/components/mars/mars-explorer";

export const metadata: Metadata = {
  title: "Mars Explorer",
  description:
    "Fly the red planet in 3D — rover landing sites, giant volcanoes and canyons, live imagery from the surface and a decade of discovery.",
};

export default function MarsPage() {
  return (
    <PageShell className="pt-28 pb-24">
      <SectionHeader
        index="05 · Mars Explorer"
        title="Next stop: Mars"
        sub="Orbit the red planet and explore the places robots are working right now — every marker is a real location with real coordinates. Pull live imagery from Curiosity, Perseverance and Opportunity, then walk the discovery timeline."
      />
      <MarsExplorer />
    </PageShell>
  );
}
