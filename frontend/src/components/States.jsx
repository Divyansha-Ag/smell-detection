import HighlightedText from "./HighlightedText";
import { SMELLS } from "../lib/smells";

const DEMO = {
  text: "The system shall be user-friendly and respond quickly.",
  evidence: { subjective: ["user-friendly"], vague: ["quickly"] },
  question: "What response time counts as quick, and for what share of requests?",
};

export function EmptyState() {
  return (
    <div className="state">
      <h2 className="state__title">Check requirements for unclear wording</h2>
      <p className="state__text">
        Paste your requirements on the left and select Review requirements. Each flagged line shows the exact words that
        caused the problem and the questions to ask to fix it.
      </p>
      <div className="example">
        <p className="example__caption">Example result</p>
        <p className="req__text">
          <HighlightedText text={DEMO.text} evidence={DEMO.evidence} />
        </p>
        <ul className="tags">
          {Object.keys(DEMO.evidence).map((s) => (
            <li key={s} className="tag" data-smell={s}>
              <span className="tag__dot" />
              {SMELLS[s].name}
            </li>
          ))}
        </ul>
        <p className="example__q">{DEMO.question}</p>
      </div>
    </div>
  );
}

export function LoadingState({ count }) {
  return (
    <div className="state" aria-busy="true">
      <h2 className="state__title">Reviewing {count} {count === 1 ? "requirement" : "requirements"}</h2>
      <p className="state__text">Drafting follow-up questions can take up to a minute for longer lists.</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton">
          <span className="skeleton__line" style={{ width: `${88 - i * 14}%` }} />
          <span className="skeleton__line" style={{ width: `${55 - i * 8}%` }} />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state">
      <div className="notice" role="alert">
        <strong>Couldn't review the requirements</strong>
        <p>{message}</p>
        <button type="button" className="btn btn--outline btn--sm" onClick={onRetry}>Try again</button>
      </div>
    </div>
  );
}

export function NoMatches({ onClear }) {
  return (
    <div className="state">
      <h2 className="state__title">No requirements match this filter</h2>
      <button type="button" className="btn btn--outline btn--sm" onClick={onClear}>Show all requirements</button>
    </div>
  );
}