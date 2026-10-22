import { useMemo, useState } from "react";
import { SMELL_ORDER, smellName } from "../lib/smells";
import { copyText, downloadText, toCsv, toMarkdown } from "../lib/export";
import { DownloadIcon } from "./Icons";

export default function SummaryStrip({ results, view, setView, smellFilter, setSmellFilter, resolvedCount }) {
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const counts = Object.fromEntries(SMELL_ORDER.map((s) => [s, 0]));
    let flagged = 0, questions = 0;
    results.forEach((r) => {
      const keys = Object.keys(r.smells);
      if (keys.length) flagged += 1;
      keys.forEach((k) => { if (k in counts) counts[k] += 1; });
      questions += r.questions?.length || 0;
    });
    return { total: results.length, flagged, clean: results.length - flagged, questions, counts };
  }, [results]);

  const present = SMELL_ORDER.filter((s) => stats.counts[s] > 0);
  const headline = stats.flagged === 0
    ? "No smells found in these requirements"
    : `${stats.flagged} of ${stats.total} requirements need clarification`;

  async function copyQuestions() {
    if (await copyText(toMarkdown(results))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  const tabs = [
    ["all", `All ${stats.total}`],
    ["flagged", `Needs review ${stats.flagged}`],
    ["clean", `Clean ${stats.clean}`],
  ];

  return (
    <div className="summary">
      <h2 className="summary__title">{headline}</h2>
      <p className="summary__sub">
        {stats.questions} follow-up {stats.questions === 1 ? "question" : "questions"} drafted. {resolvedCount} resolved.
      </p>

      {present.length > 0 && (
        <>
          <div
            className="meter"
            role="img"
            aria-label={present.map((s) => `${smellName(s)}: ${stats.counts[s]}`).join(", ")}
          >
            {present.map((s) => (
              <span key={s} className="meter__seg" data-smell={s} style={{ flexGrow: stats.counts[s] }} />
            ))}
          </div>
          <div className="legend">
            {present.map((s) => (
              <button
                key={s}
                type="button"
                className="legend__item"
                data-smell={s}
                aria-pressed={smellFilter === s}
                onClick={() => setSmellFilter(smellFilter === s ? null : s)}
              >
                <span className="legend__dot" />
                {smellName(s)}
                <span className="legend__n">{stats.counts[s]}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="controls">
        <div className="tabs" role="group" aria-label="Show requirements">
          {tabs.map(([key, label]) => (
            <button key={key} type="button" className="tabs__btn" aria-pressed={view === key} onClick={() => setView(key)}>
              {label}
            </button>
          ))}
        </div>
        <div className="controls__export">
          <button type="button" className="btn btn--outline btn--sm" onClick={copyQuestions} disabled={!stats.flagged}>
            {copied ? "Copied" : "Copy questions"}
          </button>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => downloadText("srs-review.csv", toCsv(results))}>
            <DownloadIcon width={15} height={15} /> Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}