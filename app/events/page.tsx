import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/ui";
import { EventsGrid } from "@/components/events/events-panels";

export const metadata: Metadata = {
  title: "Cosmic Events",
  description:
    "Asteroid close approaches, the annual meteor shower calendar, upcoming eclipses and solar flares — with live NASA data.",
};

export default function EventsPage() {
  return (
    <PageShell className="pt-28 pb-24">
      <SectionHeader
        index="06 · Cosmic Events"
        title="The sky on a schedule"
        sub="Most cosmic drama is predictable — meteor showers return every year, eclipses are computed centuries ahead, and asteroids announce their flybys in advance. The calendar shows what is active right now."
      />
      <EventsGrid />
    </PageShell>
  );
}
