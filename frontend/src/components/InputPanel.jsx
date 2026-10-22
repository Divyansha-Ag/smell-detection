import { useRef } from "react";
import { MAX_REQUIREMENTS, SAMPLE } from "../lib/smells";
import { UploadIcon } from "./Icons";

export default function InputPanel({ text, setText, context, setContext, count, loading, onReview }) {
  const fileRef = useRef(null);

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result));
    reader.readAsText(file);
    e.target.value = "";
  }

  function onKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onReview();
    }
  }

  return (
    <section className="panel input" aria-label="Requirements input">
      <h2 className="panel__title">Requirements</h2>
      <p className="panel__help">One requirement per line. IDs and bullets such as REQ-001 or 1.2 are ignored.</p>

      <label className="field">
        <span className="field__label">Project context (optional)</span>
        <input
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. Mobile banking app for retail customers"
        />
        <span className="field__note">Helps the follow-up questions fit your project.</span>
      </label>

      <label className="field">
        <span className="field__label">Requirements text</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={"REQ-001: The system shall be user-friendly.\nREQ-002: ..."}
          spellCheck={false}
        />
      </label>

      <div className="input__meta">
        <span>{count} {count === 1 ? "requirement" : "requirements"} found</span>
        {count > MAX_REQUIREMENTS && <span className="warn">Only the first {MAX_REQUIREMENTS} are reviewed.</span>}
      </div>

      <div className="input__tools">
        <button type="button" className="btn btn--text" onClick={() => setText(SAMPLE)}>Use sample</button>
        <button type="button" className="btn btn--text" onClick={() => fileRef.current?.click()}>
          <UploadIcon width={15} height={15} /> Upload file
        </button>
        <button type="button" className="btn btn--text" onClick={() => setText("")} disabled={!text}>Clear</button>
        <input ref={fileRef} type="file" accept=".txt,.md,.csv,text/plain" onChange={onFile} hidden />
      </div>

      <button type="button" className="btn btn--primary" disabled={!count || loading} onClick={onReview}>
        {loading ? "Reviewing…" : "Review requirements"}
      </button>
      <p className="input__hint">Ctrl or ⌘ + Enter also works.</p>
    </section>
  );
}