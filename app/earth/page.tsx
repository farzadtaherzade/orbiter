import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/ui";
import { EarthExplorer } from "@/components/earth/earth-explorer";

export const metadata: Metadata = {
  title: "Earth Explorer",
  description:
    "A 3D Earth with the real-time day/night terminator, city lights, time scrubbing and live ISS tracking.",
};

export default function EarthPage() {
  return (
    <PageShell className="pt-28 pb-24">
      <SectionHeader
        index="04 · Earth Explorer"
        title="The Blue Marble, live"
        sub="The terminator you see is computed from the actual Sun position at this moment. Drag to orbit, scroll to zoom, and scrub time to watch city lights roll across the night side. The red marker is the ISS at its true position."
      />
      <EarthExplorer />
    </PageShell>
  );
}
