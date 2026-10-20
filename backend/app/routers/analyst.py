import os, io, json, uuid, pandas as pd
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from ..db import q, now
from ..security import current_user
from ..validator import run_rules, annotate
router = APIRouter(prefix="/api")
for d in ("uploads", "outputs"): os.makedirs(d, exist_ok=True)
class Val(BaseModel): file_id: str; rule_ids: list[int]
@router.post("/files/upload")
async def upload(file: UploadFile = File(...), u=Depends(current_user)):
    ext = file.filename.lower().rsplit(".", 1)[-1]
    if ext not in ("xlsx", "xls", "csv"): raise HTTPException(400, "Only .xlsx, .xls or .csv files allowed")
    raw = await file.read()
    try: df = pd.read_csv(io.BytesIO(raw)) if ext == "csv" else pd.read_excel(io.BytesIO(raw))
    except Exception as e: raise HTTPException(400, f"Cannot read file: {e}")
    fid = uuid.uuid4().hex; path = f"uploads/{fid}.xlsx"; df.to_excel(path, index=False)
    q("INSERT INTO files VALUES(?,?,?,?,?,?)", (fid, u["id"], file.filename, path, len(df), now()), commit=True)
    return {"file_id": fid, "filename": file.filename, "rows": len(df), "columns": list(df.columns),
            "preview": json.loads(df.head(10).to_json(orient="records", date_format="iso"))}
@router.get("/rules")
def rules(u=Depends(current_user)): return q("SELECT * FROM rules WHERE active=1")
@router.post("/validate")
def validate(b: Val, u=Depends(current_user)):
    f = q("SELECT * FROM files WHERE id=? AND user_id=?", (b.file_id, u["id"]), one=True)
    if not f: raise HTTPException(404, "File not found")
    if not b.rule_ids: raise HTTPException(400, "Select at least one rule")
    rs = q(f"SELECT * FROM rules WHERE active=1 AND id IN ({','.join('?' * len(b.rule_ids))})", tuple(b.rule_ids))
    df = pd.read_excel(f["path"]); errs = run_rules(df, rs)
    out = f"outputs/{uuid.uuid4().hex}.xlsx"; annotate(f["path"], out, df, errs)
    by = {}
    for e in errs: by[e[2]] = by.get(e[2], 0) + 1
    cells = max(df.size, 1); comp = round(100 * (1 - df.isna().sum().sum() / cells), 1)
    vid = q("INSERT INTO validations(user_id,file_name,rules,total_rows,error_count,completeness,errors_by_rule,output_path,created_at) VALUES(?,?,?,?,?,?,?,?,?)",
            (u["id"], f["filename"], json.dumps([r["name"] for r in rs]), len(df), len(errs), comp, json.dumps(by), out, now()), commit=True)
    return {"id": vid, "file_name": f["filename"], "total_rows": len(df), "error_count": len(errs), "completeness": comp, "errors_by_rule": by,
            "errors": [{"row": "-" if e[0] is None else int(e[0]) + 2, "column": e[1], "rule": e[2], "issue": e[3]} for e in errs[:200]]}
def fmt(v):
    v["rules"] = json.loads(v["rules"]); v["errors_by_rule"] = json.loads(v["errors_by_rule"]); v.pop("output_path"); return v
@router.get("/validations")
def history(u=Depends(current_user)):
    return [fmt(v) for v in q("SELECT * FROM validations WHERE user_id=? ORDER BY id DESC", (u["id"],))]
def own(vid, u):
    v = q("SELECT * FROM validations WHERE id=? AND user_id=?", (vid, u["id"]), one=True)
    if not v: raise HTTPException(404, "Not found")
    return v
@router.get("/validations/{vid}/download")
def download(vid: int, u=Depends(current_user)):
    v = own(vid, u); return FileResponse(v["output_path"], filename=f"flagged_{v['file_name'].rsplit('.', 1)[0]}.xlsx")
@router.get("/validations/{vid}/errors")
def errors(vid: int, u=Depends(current_user)):
    v = own(vid, u); d = pd.read_excel(v["output_path"], sheet_name="Errors").head(200).fillna("")
    return json.loads(d.rename(columns=str.lower).to_json(orient="records"))
@router.delete("/validations/{vid}")
def delete(vid: int, u=Depends(current_user)):
    v = own(vid, u)
    if os.path.exists(v["output_path"]): os.remove(v["output_path"])
    q("DELETE FROM validations WHERE id=?", (vid,), commit=True); return {"message": "Deleted"}
@router.get("/stats")
def stats(u=Depends(current_user)):
    vs = [fmt(v) for v in q("SELECT * FROM validations WHERE user_id=? ORDER BY id DESC", (u["id"],))]
    by = {}
    for v in vs:
        for k, n in v["errors_by_rule"].items(): by[k] = by.get(k, 0) + n
    return {"files": len(vs), "errors": sum(v["error_count"] for v in vs), "flagged": sum(1 for v in vs if v["error_count"]),
            "completeness": round(sum(v["completeness"] for v in vs) / len(vs), 1) if vs else 0,
            "clean": sum(1 for v in vs if not v["error_count"]), "by_rule": by, "recent": vs[:5]}
