import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SettingsProvider, useReveal } from "@/components/pip/settings";
import { Hero, TopBar } from "@/components/pip/Hero";
import { MeetPip } from "@/components/pip/MeetPip";
import { Projects } from "@/components/pip/Projects";
import { Story } from "@/components/pip/Story";
import { Workshop } from "@/components/pip/Workshop";
import { Guestbook } from "@/components/pip/Guestbook";
import { Odometer, SecretJournal, SparkleTrail, StarBurst } from "@/components/pip/Extras";
import { Star } from "@/components/pip/Decor";
import { blip } from "@/lib/sound";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pip's Midnight Observatory — Dream Engineer at the Midnight Nursery" },
      { name: "description", content: "Meet Pip the Skull Baby, Junior Dream Engineer. I build the dreams you fall asleep inside." },
      { property: "og:title", content: "Pip's Midnight Observatory" },
      { property: "og:description", content: "An interactive storybook home for Pip, Junior Dream Engineer at the Midnight Nursery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <SettingsProvider><Page /></SettingsProvider>,
});

function Page() {
  useReveal();
  const [moonTaps, setMoonTaps] = useState(0);
  const [open, setOpen] = useState(false);
  const [burst, setBurst] = useState(0);
  const tapMoon = () => {
    const n = moonTaps + 1;
    blip("tap");
    if (n >= 3) { setOpen(true); setBurst((b) => b + 1); setMoonTaps(0); blip("success"); }
    else setMoonTaps(n);
  };
  return (
    <>
      <SparkleTrail />
      <TopBar />
      <main>
        <Hero onMoon={tapMoon} />
        <MeetPip />
        <Projects />
        <Story />
        <Workshop />
        <Guestbook />
      </main>
      <footer className="relative border-t-2 border-dashed border-border px-4 py-16 text-center">
        <Odometer />
        <p className="handwritten mt-10 text-2xl">“Sleep tight. I'll keep the stars running.” — Pip</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Made under the moonlight for haX.baby · Psst: the moon at the top is ticklish. Tap it three times.
          {moonTaps > 0 && <span className="ml-1 font-semibold text-primary">({moonTaps}/3…)</span>}
        </p>
        <a href="#top" onClick={() => blip()} className="btn-ghost-dream mt-6"><Star size={12} /> Return to the observatory</a>
      </footer>
      <StarBurst trigger={burst} />
      <SecretJournal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
