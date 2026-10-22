"""Smell detection (fine-tuned model + rule evidence) and Groq follow-up questions."""
import json, os, re, time
from pathlib import Path

import requests
import spacy
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

LABELS = ["subjective", "ambiguous", "vague", "nonverifiable", "negative", "comparative_superlative", "passive_voice"]
MODEL_DIR = Path(__file__).parent / "smell_model"      # folder downloaded from Colab
MAX_LEN = 128

DEFS = {
    "subjective": "depends on personal opinion or taste, e.g. 'user-friendly', 'intuitive'",
    "ambiguous": "admits more than one interpretation, e.g. 'and/or', 'etc.', 'as appropriate', unclear pronoun",
    "vague": "imprecise quantity or degree, e.g. 'fast', 'a large number of', 'sufficient'",
    "nonverifiable": "cannot be objectively tested, e.g. 'as much as possible', 'support', 'state-of-the-art'",
    "negative": "phrased mainly as what the system shall NOT do",
    "comparative_superlative": "comparative/superlative with no baseline, e.g. 'faster', 'best'",
    "passive_voice": "passive voice that hides the responsible actor",
}

LEX = {
    "subjective": ["user-friendly", "user friendly", "easy to use", "easy", "simple", "intuitive", "good", "best", "nice", "beautiful",
                   "attractive", "modern", "clean", "elegant", "seamless", "convenient", "pleasant", "comfortable", "appealing", "friendly", "natural"],
    "ambiguous": ["and/or", "as appropriate", "as applicable", "if possible", "if necessary", "where possible", "as required", "as needed",
                  "etc", "and so on", "or similar", "such as", "including but not limited to", "but not limited to", "may", "might", "could",
                  "either", "other", "various", "certain", "normally", "usually", "typically", "generally", "some"],
    "vague": ["fast", "quickly", "slow", "large", "small", "many", "few", "several", "adequate", "sufficient", "reasonable", "appropriate",
              "significant", "minimal", "high", "low", "good performance", "real-time", "real time", "timely", "soon", "frequently",
              "regularly", "enough", "acceptable"],
    "nonverifiable": ["as much as possible", "as little as possible", "at least", "minimize", "maximize", "state-of-the-art", "state of the art",
                      "capable of", "support", "supports", "supported", "flexible", "robust", "reliable", "efficient", "effective",
                      "best practice", "best practices", "optimal", "optimize", "scalable", "extensible", "maintainable", "future-proof",
                      "without limitation"],
}
NEG_RE = re.compile(r"\b(not|no|never|cannot|can't|won't|neither|nor|none|nothing|without)\b", re.I)

nlp = spacy.load("en_core_web_sm")
tok = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR).eval()
THR = json.loads((MODEL_DIR / "thresholds.json").read_text())
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)


def _find(words, text):
    hits = []
    for w in words:
        for m in re.finditer(r"(?<![\w-])" + re.escape(w) + r"(?![\w-])", text, re.I):
            hits.append(m.group(0))
    return hits


def rule_evidence(text):
    ev = {l: [] for l in LABELS}
    for l, words in LEX.items():
        ev[l] = sorted({h.lower() for h in _find(words, text)})
    ev["negative"] = sorted({m.group(0).lower() for m in NEG_RE.finditer(text)})
    doc = nlp(text)
    ev["comparative_superlative"] = sorted({t.text.lower() for t in doc if t.tag_ in ("JJR", "RBR", "JJS", "RBS")})
    ev["passive_voice"] = sorted({t.text.lower() for t in doc if t.dep_ in ("nsubjpass", "auxpass")})
    return ev


@torch.no_grad()
def detect(texts):
    enc = tok(texts, truncation=True, max_length=MAX_LEN, padding=True, return_tensors="pt").to(device)
    probs = torch.sigmoid(model(**enc).logits).cpu().numpy()
    out = []
    for t, p in zip(texts, probs):
        ev = rule_evidence(t)
        smells = {l: round(float(p[i]), 3) for i, l in enumerate(LABELS) if p[i] >= THR[l]}
        out.append({"requirement": t, "smells": smells, "evidence": {l: ev[l] for l in smells if ev[l]}})
    return out


# ---------------- Groq follow-up questions ----------------
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
_session = requests.Session()
FU_SYS = ("You are a senior requirements analyst reviewing an SRS. For a flawed requirement you ask short, concrete clarifying questions "
          "that a stakeholder can answer with a number, name, list or decision. Output ONLY valid JSON.")


def _groq(prompt, max_tokens=1500, temperature=0.3):
    key, model_name = os.environ["GROQ_API_KEY"], os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    msgs = [{"role": "system", "content": FU_SYS}, {"role": "user", "content": prompt}]
    payload = {"model": model_name, "messages": msgs, "max_completion_tokens": max_tokens, "temperature": temperature}
    if "gpt-oss" in model_name:
        payload["reasoning_effort"] = "low"
    for attempt in range(5):
        try:
            r = _session.post(GROQ_URL, headers={"Authorization": f"Bearer {key}", "User-Agent": "srs-review-assistant/1.0"},
                              json=payload, timeout=60)
        except requests.exceptions.RequestException as e:   # connection reset, SSL, timeout...
            if attempt == 4:
                raise RuntimeError(f"Could not reach Groq: {e}")
            time.sleep(2 * (attempt + 1))
            continue
        if r.status_code == 429:
            time.sleep(float(r.headers.get("retry-after", 3 * (attempt + 1))))
            continue
        if r.status_code == 400 and "reasoning_effort" in payload:
            payload.pop("reasoning_effort")
            continue
        if not r.ok:
            raise RuntimeError(f"Groq {r.status_code}: {r.text[:200]}")
        return r.json()["choices"][0]["message"]["content"]
    raise RuntimeError("Groq rate limit")


def follow_ups(res, context=""):
    if not res["smells"]:
        return {"questions": [], "rewrite_hint": None}
    prompt = f"""Requirement: "{res['requirement']}"
Detected smells (label: confidence): {res['smells']}
Trigger words found: {res['evidence']}
Project context (may be empty): {context or 'none'}

Smell definitions: {json.dumps({k: DEFS[k] for k in res['smells']})}

Return JSON: {{"questions": [{{"smell": "<label>", "question": "<=25 words, specific, answerable>"}}], "rewrite_hint": "a template showing the fixed requirement shape with [placeholders]"}}
Max 3 questions. Do not invent facts about the project. Do not ask about smells that were not detected."""
    txt = _groq(prompt)
    try:
        return json.loads(txt[txt.find("{"): txt.rfind("}") + 1])
    except Exception:
        return {"questions": [], "rewrite_hint": None}