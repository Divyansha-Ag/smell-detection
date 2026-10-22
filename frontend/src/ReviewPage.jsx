import { useState } from "react";

export default function ReviewPage() {
  const [text, setText] = useState("REQ-001: The system shall be user-friendly and respond quickly.\nREQ-002: Data shall be validated before saving.");
  const [context, setContext] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true); setError(""); setResults([]);
    try {
      const r = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, context }),
      });
      if (!r.ok) throw new Error((await r.json()).detail || "Request failed");
      setResults((await r.json()).results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: "2rem auto", fontFamily: "system-ui, sans-serif" }}>
      <h2>SRS Review Assistant</h2>
      <input
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
        placeholder="Project context (optional), e.g. Mobile banking app for retail customers"
        value={context} onChange={(e) => setContext(e.target.value)}
      />
      <textarea
        style={{ width: "100%", height: 180, padding: 8 }}
        placeholder="One requirement per line"
        value={text} onChange={(e) => setText(e.target.value)}
      />
      <button onClick={run} disabled={loading} style={{ marginTop: 8, padding: "8px 16px" }}>
        {loading ? "Reviewing..." : "Review requirements"}
      </button>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {results.map((r, i) => {
        const smells = Object.keys(r.smells);
        return (
          <div key={i} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginTop: 12,
                                borderLeft: `5px solid ${smells.length ? "#e67e22" : "#2ecc71"}` }}>
            <div>{r.requirement}</div>
            {smells.length === 0 && <small style={{ color: "#2e8b57" }}>No smells detected</small>}
            {smells.map((s) => (
              <span key={s} style={{ display: "inline-block", background: "#fdebd0", borderRadius: 12, padding: "2px 10px", margin: "6px 6px 0 0", fontSize: 13 }}>
                {s} ({Math.round(r.smells[s] * 100)}%){r.evidence[s] ? `: ${r.evidence[s].join(", ")}` : ""}
              </span>
            ))}
            {r.questions?.length > 0 && (
              <ul style={{ marginTop: 10 }}>
                {r.questions.map((q, j) => <li key={j}><b>{q.smell}:</b> {q.question}</li>)}
              </ul>
            )}
            {r.rewrite_hint && <div style={{ fontSize: 13, color: "#555" }}>Rewrite shape: <i>{r.rewrite_hint}</i></div>}
            {r.llm_error && <small style={{ color: "crimson" }}>Follow-up questions unavailable: {r.llm_error}</small>}
          </div>
        );
      })}
    </div>
  );
}
