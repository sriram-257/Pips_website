import { useEffect, useRef, useState } from "react";
import { SectionHeading, Star } from "./Decor";

const SCENES = [
  { title: "The First Moonbeam", emoji: "🌙", tone: "bg-paper",
    text: "One quiet night, a moonbeam slipped through the nursery window and landed — plink — in Pip's sock drawer. It was small, warm, and a little lost. Pip tucked it into a jam jar and whispered, “Don't worry. I'll find out where you belong.”" },
  { title: "The Broken Dream Machine", emoji: "⚙️", tone: "bg-secondary",
    text: "Down in the nursery basement, the great Dream Machine began to cough. Instead of fluffy dream clouds, it puffed out grey, lumpy ones. Somewhere, a child dreamed of soggy cereal. Pip rolled up a pajama sleeve. “I can fix this,” said Pip, mostly to sound brave." },
  { title: "The Great Star Search", emoji: "🚂", tone: "bg-muted",
    text: "The machine needed seven missing stars. Pip boarded the Cloud Railway with the moonbeam-jar as a nightlight, searching Puddle Peak, Biscuit Bay, and the Owl Library. One star was stuck in a teapot. Another was simply napping." },
  { title: "Dreams for Everyone", emoji: "💫", tone: "bg-accent",
    text: "With every star back in place, the machine hummed a lullaby. Pip learned something: the best dreams aren't the biggest. They're the ones that help people feel safe, brave, curious, and loved. Pip has been building those ever since." },
];

export function Story() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset["i"])); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <section id="story" className="relative px-4 py-24">
      <SectionHeading kicker="Origin story" title="How Pip became a dream engineer" />
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[180px_1fr]">
        <ol aria-label="Story progress" className="sticky top-24 hidden h-fit space-y-4 md:block">
          {SCENES.map((s, i) => (
            <li key={s.title}>
              <a href={`#scene-${i + 1}`} className={`flex items-center gap-3 font-display text-sm transition-opacity ${i === active ? "opacity-100" : "opacity-45"}`}>
                <span className={`grid h-8 w-8 place-items-center rounded-full border-2 border-foreground ${i <= active ? "bg-primary text-primary-foreground" : ""}`}>{i + 1}</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
        <div className="space-y-[30vh] pb-[10vh]">
          {SCENES.map((s, i) => (
            <article key={s.title} id={`scene-${i + 1}`} data-i={i} ref={(el) => { refs.current[i] = el; }}
              className={`reveal paper relative overflow-hidden rounded-[2.5rem] p-8 transition-transform duration-700 sm:p-12 ${s.tone} ${i === active ? "scale-100" : "scale-[0.97]"}`}>
              <span aria-hidden className="absolute -right-4 -top-6 text-[9rem] opacity-20">{s.emoji}</span>
              <p className="chip">Chapter {i + 1} of {SCENES.length}</p>
              <h3 className="mt-4 text-3xl font-semibold sm:text-4xl">{s.title}</h3>
              <p className="handwritten mt-5 max-w-xl text-xl leading-relaxed">{s.text}</p>
              <div aria-hidden className="mt-6 flex gap-2">{Array.from({ length: i + 1 }, (_, k) => <Star key={k} size={14} />)}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
