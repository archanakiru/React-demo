import bcrypt, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from .db import q, now
SECRET = "change-this-secret-in-production"
bearer = HTTPBearer()
def hash_pw(p): return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
def check_pw(p, h): return bcrypt.checkpw(p.encode(), h.encode())
def make_token(u): return jwt.encode({"sub": str(u["id"]), "exp": datetime.utcnow() + timedelta(hours=12)}, SECRET, "HS256")
def current_user(cred=Depends(bearer)):
    try: uid = int(jwt.decode(cred.credentials, SECRET, ["HS256"])["sub"])
    except Exception: raise HTTPException(401, "Invalid or expired token")
    u = q("SELECT * FROM users WHERE id=?", (uid,), one=True)
    if not u or not u["active"]: raise HTTPException(401, "Account disabled or missing")
    q("UPDATE users SET last_active=? WHERE id=?", (now(), uid), commit=True)
    return u
def admin_only(u=Depends(current_user)):
    if u["role"] != "admin": raise HTTPException(403, "Admin only")
    return u
