import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ..db import q, now
from ..security import hash_pw, check_pw, make_token, current_user
router = APIRouter(prefix="/api/auth")
class Signup(BaseModel): name: str; email: str; password: str
class Login(BaseModel): email: str; password: str; role: str
class Forgot(BaseModel): email: str
class Reset(BaseModel): email: str; token: str; new_password: str
class Change(BaseModel): old_password: str; new_password: str
class Profile(BaseModel): name: str
def pub(u): return {k: u[k] for k in ("id", "name", "email", "role", "created_at", "last_active")}
def strong(p):
    if len(p) < 6: raise HTTPException(400, "Password must be at least 6 characters")
@router.post("/signup")
def signup(b: Signup):
    if "@" not in b.email: raise HTTPException(400, "Invalid email")
    strong(b.password)
    if q("SELECT 1 FROM users WHERE email=?", (b.email.lower(),), one=True): raise HTTPException(400, "Email already registered")
    q("INSERT INTO users(name,email,password_hash,role,created_at) VALUES(?,?,?,?,?)", (b.name, b.email.lower(), hash_pw(b.password), "analyst", now()), commit=True)
    return {"message": "Account created. Please log in."}
@router.post("/login")
def login(b: Login):
    u = q("SELECT * FROM users WHERE email=?", (b.email.lower(),), one=True)
    if not u or not check_pw(b.password, u["password_hash"]): raise HTTPException(401, "Invalid email or password")
    if not u["active"]: raise HTTPException(403, "Your access has been disabled by an admin")
    if u["role"] != b.role: raise HTTPException(403, f"This account is not an {b.role}")
    q("UPDATE users SET last_active=? WHERE id=?", (now(), u["id"]), commit=True)
    return {"token": make_token(u), "user": pub(u)}
@router.post("/forgot")
def forgot(b: Forgot):
    u = q("SELECT * FROM users WHERE email=?", (b.email.lower(),), one=True)
    if not u: raise HTTPException(404, "No account with that email")
    t = secrets.token_hex(3).upper()
    q("UPDATE users SET reset_token=?,reset_exp=? WHERE id=?", (t, (datetime.now() + timedelta(minutes=15)).isoformat(), u["id"]), commit=True)
    return {"message": "Reset code generated (demo mode: shown here instead of emailed)", "reset_token": t}
@router.post("/reset")
def reset(b: Reset):
    u = q("SELECT * FROM users WHERE email=?", (b.email.lower(),), one=True)
    if not u or u["reset_token"] != b.token.upper() or datetime.fromisoformat(u["reset_exp"]) < datetime.now(): raise HTTPException(400, "Invalid or expired code")
    strong(b.new_password)
    q("UPDATE users SET password_hash=?,reset_token=NULL WHERE id=?", (hash_pw(b.new_password), u["id"]), commit=True)
    return {"message": "Password reset. Please log in."}
@router.get("/me")
def me(u=Depends(current_user)): return pub(u)
@router.put("/profile")
def profile(b: Profile, u=Depends(current_user)):
    q("UPDATE users SET name=? WHERE id=?", (b.name, u["id"]), commit=True); return {"message": "Profile updated"}
@router.post("/change-password")
def change(b: Change, u=Depends(current_user)):
    if not check_pw(b.old_password, u["password_hash"]): raise HTTPException(400, "Current password is wrong")
    strong(b.new_password)
    q("UPDATE users SET password_hash=? WHERE id=?", (hash_pw(b.new_password), u["id"]), commit=True)
    return {"message": "Password changed"}
