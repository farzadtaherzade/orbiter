import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, SectionHeader, Panel, CTA } from "@/components/ui";
import { ScaleExplorer } from "@/components/lab/scale-explorer";
import { RocketLab } from "@/components/lab/rocket-sim";
import { SpaceQuiz } from "@/components/lab/quiz";

export const metadata: Metadata = {
  title: "The Lab",
  description:
    "Interactive astrophysics: a black hole gravitational lensing simulator, the cosmic scale explorer, a rocket launch lab and a space quiz.",
};

export default function LabPage() {
  return (
    <PageShell className="pt-28 pb-24">
      <SectionHeader
        index="08 · The Lab"
        title="Instruments of curiosity"
        sub="Three working experiments plus a full-screen black hole simulator. Nothing here is a canned animation — the physics is computed live in your browser."
      />

      {/* black hole teaser */}
      <Link
        href="/lab/black-hole"
        className="group panel relative mb-6 block overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-70 transition-opacity duration-700 group-hover:opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 60% 90% at 62% 50%, rgba(252,120,40,0.35), transparent 60%), radial-gradient(ellipse 45% 60% at 62% 50%, rgba(0,0,0,1), #030712 75%)",
          }}
        />
        <div className="relative flex flex-col gap-2 p-8 md:p-12">
          <div className="mono-label text-amber">Experience 04 · Full screen</div>
          <h3 className="font-display text-3xl font-semibold text-star md:text-4xl">
            Black hole — gravitational lensing
          </h3>
          <p className="max-w-xl text-sm leading-relaxed text-dim">
            A real-time Schwarzschild raymarcher running in your GPU. Watch light
            bend around the event horizon, the accretion disk's far side appear
            above and below, and the approaching side beam brighter — then drag
            around it yourself.
          </p>
          <span className="mono-label mt-4 text-cyan">
            Enter the simulator <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </div>
      </Link>

      {/* scale */}
      <div className="mb-16">
        <SectionHeader
          index="Experience 01"
          title="Cosmic scale explorer"
          sub="42 orders of magnitude, from a proton to the observable universe. Drag the scanline through the scale of everything and compare any two objects."
        />
        <ScaleExplorer />
      </div>

      {/* rocket */}
      <div className="mb-16">
        <SectionHeader
          index="Experience 02"
          title="Rocket assembly & launch"
          sub="Build a launch vehicle from real engines, check the Tsiolkovsky rocket equation, then fly an ascent with live thrust, gravity and drag. Will you reach orbit?"
        />
        <RocketLab />
      </div>

      {/* quiz */}
      <div className="mb-6">
        <SectionHeader
          index="Experience 03"
          title="Certification exam"
          sub="Fifteen questions, real answers, no trick questions. Miss one and you'll learn why."
        />
        <SpaceQuiz />
      </div>
    </PageShell>
  );
}
