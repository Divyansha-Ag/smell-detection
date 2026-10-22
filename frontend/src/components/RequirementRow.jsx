import { SMELLS } from "../lib/smells";
import CopyButton from "./CopyButton";
import HighlightedText from "./HighlightedText";
import { CheckIcon, WarnIcon } from "./Icons";

export default function RequirementRow({ item, resolved, onToggleResolved }) {
  const smellKeys = Object.keys(item.smells);
  const flagged = smellKeys.length > 0;
  const hasAsk = item.questions?.length > 0 || item.rewrite_hint;

  return (
    <li className={`req${resolved ? " req--resolved" : ""}`}>
      <div className="req__gutter">
        <span className="req__num">{item.index + 1}</span>
        {flagged ? (
          <WarnIcon className="req__state req__state--warn" aria-label="Needs clarification" role="img" />
        ) : (
          <CheckIcon className="req__state req__state--ok" aria-label="No smells found" role="img" />
        )}
      </div>

      <div className="req__body">
        <div className="req__content">
          <p className="req__text">
            <HighlightedText text={item.requirement} evidence={item.evidence} />
          </p>

          {flagged && (
            <ul className="tags">
              {smellKeys.map((s) => (
                <li key={s} className="tag" data-smell={s} title={SMELLS[s]?.hint}>
                  <span className="tag__dot" />
                  {SMELLS[s]?.name ?? s}
                  <span className="tag__conf">{Math.round(item.smells[s] * 100)}%</span>
                </li>
              ))}
            </ul>
          )}

          {!flagged && <p className="req__clean">No smells found.</p>}

          {flagged && hasAsk && (
            <div className="ask">
              {item.questions?.length > 0 && (
                <>
                  <h3 className="ask__title">Questions to ask</h3>
                  <ol className="ask__list">
                    {item.questions.map((q, i) => (
                      <li key={i} className="ask__item">
                        <span className="ask__dot" data-smell={q.smell} />
                        <span className="ask__q">{q.question}</span>
                        <CopyButton text={q.question} label="Copy question" />
                      </li>
                    ))}
                  </ol>
                </>
              )}
              {item.rewrite_hint && (
                <p className="ask__rewrite">
                  <span>Rewrite shape</span>
                  {item.rewrite_hint}
                </p>
              )}
            </div>
          )}
        </div>

        {item.llm_error && (
          <p className="notice notice--inline">Follow-up questions couldn't be generated: {item.llm_error}</p>
        )}

        {flagged && (
          <div className="req__actions">
            <button type="button" className="btn btn--text" onClick={onToggleResolved}>
              {resolved ? "Reopen" : "Mark as resolved"}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}