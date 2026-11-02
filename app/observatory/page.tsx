import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/ui";
import { IssMap } from "@/components/observatory/iss-map";
import {
  ApodPanel,
  NeoPanel,
  SolarActivityPanel,
  EonetPanel,
  ApiKeyPanel,
} from "@/components/observatory/panels";

export const metadata: Metadata = {
  title: "Live Observatory",
  description:
    "Live space telemetry: ISS ground track, NASA's Astronomy Picture of the Day, near-Earth asteroids, solar flares and natural events — straight from NASA feeds.",
};

export default function ObservatoryPage() {
  return (
    <PageShell className="pt-28 pb-24">
      <SectionHeader
        index="01 · Live Observatory"
        title="Right now, in orbit"
        sub="Everything on this page is fetched live from NASA and open trackers, with source and freshness shown on every panel. If a feed is unreachable, an archived sample is shown and clearly labeled — nothing here is invented."
      />

      <div className="flex flex-col gap-6">
        <IssMap />

        <div className="grid gap-6 lg:grid-cols-2">
          <ApodPanel />
          <div className="flex flex-col gap-6">
            <SolarActivityPanel />
            <NeoPanel />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <EonetPanel />
          <ApiKeyPanel />
        </div>
      </div>
    </PageShell>
  );
}
