import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/ui";
import { DeepSpaceGallery } from "@/components/deep-space/gallery";
import { ExoplanetConsole } from "@/components/deep-space/exoplanets";

export const metadata: Metadata = {
  title: "Deep Space",
  description:
    "Nebulae, galaxies and black holes from the NASA Image Library, plus a live exoplanet discovery console querying the NASA Exoplanet Archive.",
};

export default function DeepSpacePage() {
  return (
    <PageShell className="pt-28 pb-24">
      <SectionHeader
        index="03 · Deep Space"
        title="Where the light is ancient"
        sub="Eight destinations beyond the Solar System — stellar nurseries, galactic neighbors and the only two black holes humanity has ever photographed. Every photograph is resolved live from NASA's Image Library."
      />
      <DeepSpaceGallery />

      <div className="mt-16">
        <SectionHeader
          index="03.1 · Exoplanets"
          title="Worlds beyond counting"
          sub="Over 6,000 confirmed exoplanets are catalogued. Query the real archive: filter by discovery method, year and size, then click any point to inspect the planet. The scatter maps every world by orbital period and radius."
        />
        <ExoplanetConsole />
      </div>
    </PageShell>
  );
}
