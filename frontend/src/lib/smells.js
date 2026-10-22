
// Display names, one-line explanations and sample data for the 7 smell labels the backend returns.
export const SMELLS = {
  subjective: { name: "Subjective", hint: "Depends on opinion, not measurement" },
  ambiguous: { name: "Ambiguous", hint: "Can be read more than one way" },
  vague: { name: "Vague", hint: "No measurable quantity or threshold" },
  nonverifiable: { name: "Not verifiable", hint: "Can't be tested or proven" },
  negative: { name: "Negative", hint: "Says what not to do instead of what to do" },
  comparative_superlative: { name: "Comparative", hint: "Better or faster than what?" },
  passive_voice: { name: "Passive voice", hint: "Doesn't say who performs the action" },
};

export const SMELL_ORDER = Object.keys(SMELLS);

export const MAX_REQUIREMENTS = 30; // keep in sync with MAX_REQS in backend/main.py

export const SAMPLE = `REQ-001: The system shall be user-friendly and respond quickly.
REQ-002: Data shall be validated before saving.
REQ-003: The app must not crash and should be faster than the old version.
REQ-004: The payment service shall confirm each transaction to the user within 3 seconds for 99% of requests.
REQ-005: Users can upload files, images and/or videos, etc.
REQ-006: The dashboard shall support as much reporting as possible.
REQ-007: The API shall return an error code within 500 ms when authentication fails.
REQ-008: Reports shall be generated and archived as appropriate.`;

// Mirrors split_requirements() in backend/main.py so the count shown here matches what gets reviewed.
export function splitRequirements(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(REQ[-_ ]?\d+[:.)]?|\d+(\.\d+)*[:.)]?|[-*•])\s*/i, "").trim())
    .filter((line) => line.split(/\s+/).filter(Boolean).length >= 4);
}

export function smellName(label) {
  return SMELLS[label]?.name ?? label;
}