const UNREACHABLE = "The review server isn't reachable. Check that the backend is running on port 8000.";

export async function checkHealth() {
  try {
    const res = await fetch("/api/health");
    return res.ok;
  } catch {
    return false;
  }
}

export async function reviewRequirements(text, context, signal) {
  let res;
  try {
    res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, context }),
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new Error(UNREACHABLE);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    if ([502, 503, 504].includes(res.status) || (res.status === 500 && !data)) throw new Error(UNREACHABLE);
    throw new Error(typeof data?.detail === "string" ? data.detail : `The server returned an error (${res.status}).`);
  }
  return data.results;
}