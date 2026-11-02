import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/ui";
import { SolarExplorer } from "@/components/solar-system/solar-explorer";

export const metadata: Metadata = {
  title: "Solar System",
  description:
    "A living 3D orrery of the Solar System — real orbital periods, selectable planets, time control, realistic-scale mode and side-by-side comparison.",
};

export default function SolarSystemPage() {
  return (
    <PageShell className="pt-28 pb-24">
      <SectionHeader
        index="02 · Solar System"
        title="A living orrery"
        sub="All eight planets move at their true relative speeds — Mercury laps the Sun four times for every Earth year. Click any planet or its label to fly to it, then control time itself. Orbital elements and facts come from NASA's planetary fact sheets."
      />
      <SolarExplorer />
    </PageShell>
  );
}
