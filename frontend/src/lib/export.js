import { smellName } from "./smells";

export function toMarkdown(results) {
  const blocks = [];
  results.forEach((r, i) => {
    const smells = Object.keys(r.smells);
    if (!smells.length) return;
    const lines = [`### Requirement ${i + 1}`, r.requirement, "", `Smells: ${smells.map(smellName).join(", ")}`];
    if (r.questions?.length) {
      lines.push("", "Questions:");
      r.questions.forEach((q) => lines.push(`- ${q.question}`));
    }
    if (r.rewrite_hint) lines.push("", `Rewrite shape: ${r.rewrite_hint}`);
    blocks.push(lines.join("\n"));
  });
  return blocks.join("\n\n");
}

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export function toCsv(results) {
  const header = ["#", "requirement", "smells", "trigger_words", "questions", "rewrite_shape"];
  const rows = results.map((r, i) =>
    [
      i + 1,
      r.requirement,
      Object.keys(r.smells).map(smellName).join("; "),
      Object.values(r.evidence || {}).flat().join("; "),
      (r.questions || []).map((q) => q.question).join(" | "),
      r.rewrite_hint || "",
    ].map(csvCell).join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

export function downloadText(filename, content, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}