import sqlite3, json
from datetime import datetime
DB = "dqm.db"
def now(): return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
def q(sql, args=(), one=False, commit=False):
    c = sqlite3.connect(DB); c.row_factory = sqlite3.Row
    cur = c.execute(sql, args)
    if commit: c.commit(); r = cur.lastrowid
    elif one:
        row = cur.fetchone(); r = dict(row) if row else None
    else: r = [dict(x) for x in cur.fetchall()]
    c.close(); return r
def init_db():
    from .security import hash_pw
    q("""CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,email TEXT UNIQUE,
      password_hash TEXT,role TEXT,active INTEGER DEFAULT 1,created_at TEXT,last_active TEXT,reset_token TEXT,reset_exp TEXT)""", commit=True)
    q("""CREATE TABLE IF NOT EXISTS rules(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,type TEXT,description TEXT,
      params TEXT,active INTEGER DEFAULT 1,created_at TEXT)""", commit=True)
    q("""CREATE TABLE IF NOT EXISTS files(id TEXT PRIMARY KEY,user_id INTEGER,filename TEXT,path TEXT,rows INTEGER,created_at TEXT)""", commit=True)
    q("""CREATE TABLE IF NOT EXISTS validations(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER,file_name TEXT,rules TEXT,
      total_rows INTEGER,error_count INTEGER,completeness REAL,errors_by_rule TEXT,output_path TEXT,created_at TEXT)""", commit=True)
    if not q("SELECT 1 FROM users WHERE role='admin'", one=True):
        q("INSERT INTO users(name,email,password_hash,role,created_at) VALUES(?,?,?,?,?)",
          ("Admin", "admin@dqm.com", hash_pw("Admin@123"), "admin", now()), commit=True)
    if not q("SELECT 1 FROM rules", one=True):
        for n, t, d, p in [("Null Check", "null_check", "Flags empty cells in all columns", {}),
            ("Duplicate Rows", "duplicate_check", "Flags repeated rows", {}),
            ("Required Columns", "required_columns", "Columns that must exist (comma separated)", {"columns": "id,name"}),
            ("Outlier Detection (IQR)", "outlier_check", "Flags numeric values outside 1.5x IQR", {}),
            ("Whitespace Check", "whitespace_check", "Flags text with leading/trailing spaces", {}),
            ("Negative Values", "negative_check", "Flags negative numbers", {})]:
            q("INSERT INTO rules(name,type,description,params,created_at) VALUES(?,?,?,?,?)", (n, t, d, json.dumps(p), now()), commit=True)
