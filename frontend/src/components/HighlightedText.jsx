import { smellName } from "../lib/smells";

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Wraps the trigger words the backend found in a colored marker, so reviewers see exactly why a line was flagged.
export default function HighlightedText({ text, evidence }) {
  const wordToSmell = {};
  Object.entries(evidence || {}).forEach(([smell, words]) =>
    words.forEach((w) => {
      const key = w.toLowerCase();
      if (!wordToSmell[key]) wordToSmell[key] = smell;
    })
  );
  const words = Object.keys(wordToSmell).sort((a, b) => b.length - a.length);
  if (!words.length) return <>{text}</>;

  const re = new RegExp(`(?<![\\w-])(${words.map(escapeRe).join("|")})(?![\\w-])`, "gi");
  return text.split(re).map((part, i) => {
    if (i % 2 === 0) return part;
    const smell = wordToSmell[part.toLowerCase()];
    return (
      <mark key={i} className="mk" data-smell={smell} title={smellName(smell)}>
        {part}
      </mark>
    );
  });
}