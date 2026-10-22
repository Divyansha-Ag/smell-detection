import { useEffect, useMemo, useRef, useState } from "react";
import { checkHealth, reviewRequirements } from "./lib/api";
import { splitRequirements } from "./lib/smells";
import TopBar from "./components/TopBar";
import InputPanel from "./components/InputPanel";
import SummaryStrip from "./components/SummaryStrip";
import RequirementRow from "./components/RequirementRow";
import { EmptyState, ErrorState, LoadingState, NoMatches } from "./components/States";

export default function App() {
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(null);
  const [view, setView] = useState("all");
  const [smellFilter, setSmellFilter] = useState(null);
  const [resolved, setResolved] = useState(() => new Set());
  const abortRef = useRef(null);

  const count = useMemo(() => splitRequirements(text).length, [text]);

  useEffect(() => {
    checkHealth().then(setOnline);
  }, []);

  async function runReview() {
    if (!count) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setError("");
    setView("all");
    setSmellFilter(null);
    setResolved(new Set());
    try {
      const data = await reviewRequirements(text, context, controller.signal);
      setResults(data);
      setStatus("done");
      setOnline(true);
    } catch (e) {
      if (e.name === "AbortError") return;
      setError(e.message);
      setStatus("error");
      checkHealth().then(setOnline);
    }
  }

  const indexed = useMemo(() => results.map((r, index) => ({ ...r, index })), [results]);
  const visible = indexed.filter((r) => {
    const flagged = Object.keys(r.smells).length > 0;
    if (view === "flagged" && !flagged) return false;
    if (view === "clean" && flagged) return false;
    if (smellFilter && !(smellFilter in r.smells)) return false;
    return true;
  });

  function toggleResolved(index) {
    setResolved((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  return (
    <>
      <TopBar online={online} />
      <main className="layout">
        <InputPanel
          text={text}
          setText={setText}
          context={context}
          setContext={setContext}
          count={count}
          loading={status === "loading"}
          onReview={runReview}
        />

        <section className="panel results" aria-label="Review results" aria-live="polite">
          {status === "idle" && <EmptyState />}
          {status === "loading" && <LoadingState count={Math.min(count, 30)} />}
          {status === "error" && <ErrorState message={error} onRetry={runReview} />}
          {status === "done" && (
            <>
              <SummaryStrip
                results={results}
                view={view}
                setView={setView}
                smellFilter={smellFilter}
                setSmellFilter={setSmellFilter}
                resolvedCount={resolved.size}
              />
              {visible.length === 0 ? (
                <NoMatches onClear={() => { setView("all"); setSmellFilter(null); }} />
              ) : (
                <ol className="reqlist">
                  {visible.map((item) => (
                    <RequirementRow
                      key={item.index}
                      item={item}
                      resolved={resolved.has(item.index)}
                      onToggleResolved={() => toggleResolved(item.index)}
                    />
                  ))}
                </ol>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}