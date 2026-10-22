import { useState } from "react";
import { copyText } from "../lib/export";
import { CheckIcon, CopyIcon } from "./Icons";

export default function CopyButton({ text, label = "Copy" }) {
  const [done, setDone] = useState(false);

  async function onClick() {
    if (await copyText(text)) {
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    }
  }

  return (
    <button type="button" className="icon-btn" onClick={onClick} aria-label={done ? "Copied" : label} title={done ? "Copied" : label}>
      {done ? <CheckIcon width={16} height={16} style={{ color: "var(--ok)" }} /> : <CopyIcon width={16} height={16} />}
    </button>
  );
}