import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..db import q, now
from ..security import admin_only, hash_pw
router = APIRouter(prefix="/api/admin")
TYPES = ["null_check", "duplicate_check", "required_columns", "outlier_check", "whitespace_check", "negative_check"]
class Rule(BaseModel): name: str; type: str; description: str = ""; columns: str = ""; active: bool = True
class NewUser(BaseModel): name: str; email: str; password: str; role: str = "analyst"
class UserUp(BaseModel): role: str | None = None; active: bool | None = None
@router.get("/stats")
def stats(a=Depends(admin_only)):
    c = lambda s: q(s, one=True)["n"]
    return {"analysts": c("SELECT COUNT(*) n FROM users WHERE role='analyst'"), "active_analysts": c("SELECT COUNT(*) n FROM users WHERE role='analyst' AND active=1"),
            "reports": c("SELECT COUNT(*) n FROM validations WHERE error_count>0"), "validations": c("SELECT COUNT(*) n FROM validations"),
            "errors": c("SELECT COALESCE(SUM(error_count),0) n FROM validations"), "rules": c("SELECT COUNT(*) n FROM rules WHERE active=1"),
            "analyst_list": q("SELECT u.name,u.email,u.active,u.last_active,(SELECT COUNT(*) FROM validations v WHERE v.user_id=u.id) files FROM users u WHERE role='analyst' ORDER BY last_active DESC LIMIT 8"),
            "recent": q("SELECT v.file_name,v.error_count,v.created_at,u.name FROM validations v JOIN users u ON u.id=v.user_id ORDER BY v.id DESC LIMIT 6")}
@router.get("/rules")
def rules(a=Depends(admin_only)):
    r = q("SELECT * FROM rules ORDER BY id")
    for x in r: x["columns"] = json.loads(x["params"] or "{}").get("columns", "")
    return {"rules": r, "types": TYPES}
def chk(b):
    if b.type not in TYPES: raise HTTPException(400, "Unknown rule type")
    if b.type == "required_columns" and not b.columns.strip(): raise HTTPException(400, "Enter the required columns")
@router.post("/rules")
def add_rule(b: Rule, a=Depends(admin_only)):
    chk(b); q("INSERT INTO rules(name,type,description,params,active,created_at) VALUES(?,?,?,?,?,?)", (b.name, b.type, b.description, json.dumps({"columns": b.columns}), int(b.active), now()), commit=True)
    return {"message": "Rule added"}
@router.put("/rules/{rid}")
def edit_rule(rid: int, b: Rule, a=Depends(admin_only)):
    chk(b); q("UPDATE rules SET name=?,type=?,description=?,params=?,active=? WHERE id=?", (b.name, b.type, b.description, json.dumps({"columns": b.columns}), int(b.active), rid), commit=True)
    return {"message": "Rule updated"}
@router.delete("/rules/{rid}")
def del_rule(rid: int, a=Depends(admin_only)):
    q("DELETE FROM rules WHERE id=?", (rid,), commit=True); return {"message": "Rule deleted"}
@router.get("/users")
def users(a=Depends(admin_only)):
    return q("SELECT id,name,email,role,active,created_at,last_active FROM users ORDER BY id DESC")
@router.post("/users")
def add_user(b: NewUser, a=Depends(admin_only)):
    if b.role not in ("analyst", "admin"): raise HTTPException(400, "Bad role")
    if q("SELECT 1 FROM users WHERE email=?", (b.email.lower(),), one=True): raise HTTPException(400, "Email exists")
    q("INSERT INTO users(name,email,password_hash,role,created_at) VALUES(?,?,?,?,?)", (b.name, b.email.lower(), hash_pw(b.password), b.role, now()), commit=True)
    return {"message": "User added"}
@router.put("/users/{uid}")
def upd_user(uid: int, b: UserUp, a=Depends(admin_only)):
    if uid == a["id"]: raise HTTPException(400, "You cannot change your own access")
    if b.role: q("UPDATE users SET role=? WHERE id=?", (b.role, uid), commit=True)
    if b.active is not None: q("UPDATE users SET active=? WHERE id=?", (int(b.active), uid), commit=True)
    return {"message": "User updated"}
@router.delete("/users/{uid}")
def del_user(uid: int, a=Depends(admin_only)):
    if uid == a["id"]: raise HTTPException(400, "You cannot remove yourself")
    q("DELETE FROM users WHERE id=?", (uid,), commit=True); return {"message": "User removed"}
