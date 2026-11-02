"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNowSeconds } from "@/hooks/use-now";

const LINKS = [
  { href: "/observatory", label: "Observatory" },
  { href: "/solar-system", label: "Solar System" },
  { href: "/deep-space", label: "Deep Space" },
  { href: "/earth", label: "Earth" },
  { href: "/mars", label: "Mars" },
  { href: "/events", label: "Events" },
  { href: "/missions", label: "Missions" },
  { href: "/lab", label: "Lab" },
];

function UtcClock() {
  const seconds = useNowSeconds();
  const time = seconds === null ? null : new Date(seconds * 1000).toISOString().slice(11, 19);
  return (
    <span
      className="hidden font-mono text-[10px] tracking-[0.18em] text-cyan/80 tabular-nums lg:block"
      aria-label="Current UTC time"
    >
      {time ? `${time} UTC` : "--:--:-- UTC"}
    </span>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // close the mobile menu when the route changes (adjust-during-render pattern)
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    let raf = requestAnimationFrame(onScroll); // initial state after paint
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500 ${
        scrolled ? "border-edge bg-void/95" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="Orbiter home">
          <span className="relative inline-block h-6 w-6" aria-hidden>
            <span className="absolute inset-0 rounded-full border border-cyan/70" />
            <span className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nasa-bright" />
            <span className="absolute inset-[-4px] animate-spin-slow rounded-full border-t border-worm/80" />
          </span>
          <span className="font-display text-lg font-bold tracking-[0.22em] text-star">
            ORBITER
          </span>
          <span className="mono-label hidden md:block">Deep Space Observatory</span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`px-3 py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors ${
                  active ? "text-cyan" : "text-dim hover:text-star"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <UtcClock />
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-edge xl:hidden"
          >
            <span className={`h-px w-4 bg-star transition-transform duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
            <span className={`h-px w-4 bg-star transition-transform duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <div
        className={`fixed inset-0 top-16 z-40 bg-void transition-all duration-500 xl:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="flex flex-col px-6 pt-6" aria-label="Mobile">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center justify-between border-b border-edge py-4 font-display text-2xl text-star transition-all duration-500 ${
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
            >
              {l.label}
              <span className="mono-label">{String(i + 1).padStart(2, "0")}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
