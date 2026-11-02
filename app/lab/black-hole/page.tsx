import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/ui";
import { BlackHoleLab } from "@/components/lab/black-hole";

export const metadata: Metadata = {
  title: "Black Hole — Gravitational Lensing",
  description:
    "A real-time Schwarzschild raymarcher: light bending around an event horizon, an accretion disk with Doppler beaming and gravitational redshift. Drag to orbit it yourself.",
};

export default function BlackHolePage() {
  return (
    <PageShell className="pt-28 pb-24">
      <SectionHeader
        index="08.4 · The Lab"
        title="Gargantua, in a browser tab"
        sub="Every pixel integrates a photon's path through curved spacetime — the same mathematics that produced humanity's first black hole photographs. Drag to change your viewing angle; adjust the instrument panel to change the physics."
      />
      <BlackHoleLab />
    </PageShell>
  );
}
