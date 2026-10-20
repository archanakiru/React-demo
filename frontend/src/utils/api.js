const BASE = "http://localhost:8000/api";
export async function api(path, { method = "GET", body, form } = {}) {
  const h = {}; const t = localStorage.getItem("token");
  if (t) h.Authorization = "Bearer " + t;
  if (body) h["Content-Type"] = "application/json";
  let r;
  try { r = await fetch(BASE + path, { method, headers: h, body: form || (body ? JSON.stringify(body) : undefined) }); }
  catch { throw new Error("Cannot reach server. Is the backend running on port 8000?"); }
  if (r.status === 401 && t) { localStorage.clear(); window.location = "/login"; }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(typeof d.detail === "string" ? d.detail : "Request failed");
  return d;
}
export async function downloadValidation(id) {
  const r = await fetch(`${BASE}/validations/${id}/download`, { headers: { Authorization: "Bearer " + localStorage.getItem("token") } });
  if (!r.ok) throw new Error("Download failed");
  const a = document.createElement("a"); a.href = URL.createObjectURL(await r.blob()); a.download = `flagged_report_${id}.xlsx`; a.click();
}
