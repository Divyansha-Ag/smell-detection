import re
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import smell_engine as eng

app = FastAPI(title="SRS Review Assistant")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # Vite dev server
    allow_methods=["*"], allow_headers=["*"],
)

MAX_REQS = 30


class ReviewIn(BaseModel):
    text: str                 # one requirement per line (IDs / bullets are stripped)
    context: str = ""         # optional project description


def split_requirements(text: str):
    lines = [re.sub(r"^\s*(REQ[-_ ]?\d+[:.)]?|\d+(\.\d+)*[:.)]?|[-*•])\s*", "", ln).strip() for ln in text.splitlines()]
    return [l for l in lines if len(l.split()) >= 4]


@app.get("/api/health")
def health():
    return {"ok": True, "labels": eng.LABELS}


@app.post("/api/review")
def review(body: ReviewIn):
    reqs = split_requirements(body.text)
    if not reqs:
        raise HTTPException(400, "No requirements found (need at least 4 words per line).")
    reqs = reqs[:MAX_REQS]
    results = eng.detect(reqs)

    def add_fu(res):
        try:
            res.update(eng.follow_ups(res, body.context))
        except Exception as e:                      # keep detection results even if Groq fails
            res.update({"questions": [], "rewrite_hint": None, "llm_error": str(e)[:200]})
        return res

    with ThreadPoolExecutor(max_workers=2) as ex:
        return {"results": list(ex.map(add_fu, results))}