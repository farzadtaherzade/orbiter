"use client";

import { useState } from "react";
import { QUIZ_QUESTIONS } from "@/data/quiz";
import { Panel, Chip } from "@/components/ui";

export function SpaceQuiz() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const q = QUIZ_QUESTIONS[index];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === q.answer;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, correct]);
  };

  const next = () => {
    if (index + 1 >= QUIZ_QUESTIONS.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    const rank =
      pct >= 90 ? "Flight Director" :
      pct >= 70 ? "Mission Specialist" :
      pct >= 50 ? "Payload Engineer" :
      pct >= 30 ? "Flight Trainee" : "Ground Support";
    return (
      <Panel corners className="mx-auto max-w-xl p-8 text-center">
        <div className="mono-label text-cyan">Mission debrief</div>
        <div className="mt-3 font-display text-6xl font-bold text-glow text-star tabular-nums">
          {pct}%
        </div>
        <p className="mt-2 font-mono text-sm text-dim">
          {score} of {QUIZ_QUESTIONS.length} correct — rank: <span className="text-cyan">{rank}</span>
        </p>
        <div className="mt-6 flex justify-center gap-1.5">
          {answers.map((a, i) => (
            <span
              key={i}
              aria-hidden
              className={`h-2 w-6 rounded-full ${a ? "bg-live" : "bg-worm"}`}
            />
          ))}
        </div>
        <button
          onClick={restart}
          className="mono-label mt-8 border border-cyan/60 px-6 py-2.5 text-cyan transition-colors hover:bg-cyan/10"
        >
          Fly again
        </button>
      </Panel>
    );
  }

  return (
    <Panel corners className="mx-auto max-w-2xl p-6 md:p-8">
      {/* progress */}
      <div className="mb-6 flex items-center gap-4">
        <span className="mono-label shrink-0">
          Q{index + 1}/{QUIZ_QUESTIONS.length}
        </span>
        <div className="h-0.5 flex-1 overflow-hidden rounded bg-edge">
          <div
            className="h-full bg-cyan transition-all duration-500"
            style={{ width: `${((index + (picked !== null ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100}%` }}
          />
        </div>
        <Chip tone="cyan">{score} ✓</Chip>
      </div>

      <Chip>{q.category}</Chip>
      <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-star md:text-2xl">
        {q.question}
      </h3>

      <div className="mt-6 space-y-2.5" role="radiogroup" aria-label="Answer options">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const isPicked = i === picked;
          const state =
            picked === null
              ? "idle"
              : isAnswer
                ? "correct"
                : isPicked
                  ? "wrong"
                  : "dim";
          return (
            <button
              key={opt}
              role="radio"
              aria-checked={isPicked}
              disabled={picked !== null}
              onClick={() => choose(i)}
              className={`block w-full border px-4 py-3 text-left text-sm transition-all duration-300 ${
                state === "idle"
                  ? "border-edge text-dim hover:border-cyan/60 hover:text-star"
                  : state === "correct"
                    ? "border-live bg-live/10 text-live"
                    : state === "wrong"
                      ? "border-worm bg-worm/10 text-worm"
                      : "border-edge/50 text-faint"
              }`}
            >
              <span className="mr-3 font-mono text-[10px]">{String.fromCharCode(65 + i)}</span>
              {opt}
              {state === "correct" && <span className="ml-2">✓</span>}
              {state === "wrong" && <span className="ml-2">✕</span>}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-5 border-l-2 border-cyan/60 bg-panel-2/50 p-4">
          <div className="mono-label mb-1 text-cyan">Why</div>
          <p className="text-xs leading-relaxed text-dim">{q.explanation}</p>
          <button
            onClick={next}
            className="mono-label mt-4 border border-cyan/60 px-5 py-2 text-cyan transition-colors hover:bg-cyan/10"
          >
            {index + 1 >= QUIZ_QUESTIONS.length ? "See results" : "Next question →"}
          </button>
        </div>
      )}
    </Panel>
  );
}
