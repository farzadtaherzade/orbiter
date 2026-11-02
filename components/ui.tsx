import type { ReactNode } from "react";
import Link from "next/link";

/* ── Panel ─────────────────────────────────────────────────────── */
export function Panel({
  children,
  className = "",
  corners = false,
}: {
  children: ReactNode;
  className?: string;
  corners?: boolean;
}) {
  return (
    <div className={`panel ${corners ? "hud-corners" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ── Section header ────────────────────────────────────────────── */
export function SectionHeader({
  index,
  title,
  sub,
  className = "",
}: {
  index?: string;
  title: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={`mb-8 ${className}`}>
      {index && (
        <div className="mono-label mb-3 flex items-center gap-3 text-cyan">
          <span>{index}</span>
          <span className="h-px w-12 bg-cyan/40" aria-hidden />
        </div>
      )}
      <h2 className="font-display text-3xl font-semibold tracking-tight text-star md:text-4xl">
        {title}
      </h2>
      {sub && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dim">{sub}</p>}
    </div>
  );
}

/* ── Data status badge ─────────────────────────────────────────── */
export type DataState = "live" | "cached" | "sample" | "loading" | "error";

const STATUS_STYLE: Record<DataState, string> = {
  live: "text-live",
  cached: "text-cyan",
  sample: "text-amber",
  loading: "text-dim",
  error: "text-worm",
};

const STATUS_TEXT: Record<DataState, string> = {
  live: "LIVE",
  cached: "CACHED",
  sample: "ARCHIVED SAMPLE",
  loading: "SYNCING",
  error: "OFFLINE",
};

export function StatusBadge({
  state,
  age,
  className = "",
}: {
  state: DataState;
  age?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase ${STATUS_STYLE[state]} ${className}`}
      role="status"
      aria-label={`Data status: ${STATUS_TEXT[state]}${age ? `, ${age}` : ""}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full bg-current ${
          state === "live" ? "animate-pulse-dot" : ""
        }`}
        aria-hidden
      />
      {STATUS_TEXT[state]}
      {age && <span className="text-faint normal-case tracking-normal">· {age}</span>}
    </span>
  );
}

/* ── Source chip ───────────────────────────────────────────────── */
export function SourceChip({
  source,
  href,
}: {
  source: string;
  href?: string;
}) {
  const inner = (
    <>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden className="opacity-60">
        <path d="M3 1h6v6M9 1L1 9" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      {source}
    </>
  );
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-faint transition-colors hover:text-cyan"
    >
      {inner}
    </a>
  ) : (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-faint">
      {inner}
    </span>
  );
}

/* ── Stat ──────────────────────────────────────────────────────── */
export function Stat({
  label,
  value,
  unit,
  className = "",
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mono-label mb-1">{label}</div>
      <div className="font-mono text-lg text-star tabular-nums">
        {value}
        {unit && <span className="ml-1 text-xs text-faint">{unit}</span>}
      </div>
    </div>
  );
}

/* ── Chip (category tag) ───────────────────────────────────────── */
export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "red" | "amber" | "cyan" }) {
  const tones = {
    default: "border-edge text-dim",
    red: "border-worm/50 text-worm",
    amber: "border-amber/50 text-amber",
    cyan: "border-cyan/50 text-cyan",
  };
  return (
    <span className={`inline-block border px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase ${tones[tone]}`}>
      {children}
    </span>
  );
}

/* ── CTA button ────────────────────────────────────────────────── */
export function CTA({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-nasa text-white border-nasa-bright/40 hover:bg-nasa-bright hover:text-void"
      : "bg-transparent text-star border-edge hover:border-cyan hover:text-cyan";
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 border px-5 py-2.5 font-mono text-xs tracking-[0.14em] uppercase transition-all duration-300 ${styles} ${className}`}
    >
      {children}
      <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

/* ── Spinner ───────────────────────────────────────────────────── */
export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-dim" role="status" aria-live="polite">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border border-edge border-t-cyan" aria-hidden />
      <span className="font-mono text-xs tracking-[0.14em] uppercase">{label ?? "Loading"}</span>
    </div>
  );
}

/* ── Empty / fallback state ────────────────────────────────────── */
export function FallbackState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="panel hud-corners flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <div className="mono-label text-amber">Signal Lost</div>
      <div className="font-display text-lg text-star">{title}</div>
      {detail && <p className="max-w-md text-sm text-dim">{detail}</p>}
    </div>
  );
}

/* ── Page shell (shared layout inside pages) ───────────────────── */
export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 md:px-8 ${className}`}>{children}</div>;
}
