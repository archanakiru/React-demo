import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { searchIndex } from "../utils/searchIndex.js";
export default function Navbar() {
  const { user, logout } = useAuth(); const nav = useNavigate();
  const [q, setQ] = useState(""); const [open, setOpen] = useState(false);
  const res = q.trim() ? searchIndex.filter((i) => i.role === user.role && (i.label + " " + i.keys).toLowerCase().includes(q.toLowerCase())) : [];
  const go = (p) => { setQ(""); nav(p); };
  return (
    <header className="navbar">
      <div className="brand"><span className="logo"><ShieldCheck size={18} /></span>Clear<b>DQ</b></div>
      <div className="search"><Search size={16} />
        <input placeholder="Search pages & content..." value={q} onChange={(e) => setQ(e.target.value)} />
        {q.trim() && <div className="search-results">{res.length ? res.map((r) => <div key={r.path} onClick={() => go(r.path)}>{r.label}</div>) : <div className="muted">No results</div>}</div>}
      </div>
      <div className="profile">
        <button className="avatar" onClick={() => setOpen(!open)}>{user.name[0].toUpperCase()}</button>
        {open && <div className="profile-menu">
          <b>{user.name}</b><span>{user.email}</span><span className="badge">{user.role}</span>
          <button onClick={() => { setOpen(false); nav(`/${user.role}/settings`); }}><User size={14} /> View profile</button>
          <button className="danger" onClick={() => { logout(); nav("/login"); }}><LogOut size={14} /> Logout</button>
        </div>}
      </div>
    </header>
  );
}
