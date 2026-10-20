import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileCheck2, History, FileText, Settings, LifeBuoy, Library, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
const analyst = [["", "Overview", LayoutDashboard], ["validation", "Data Validation", FileCheck2], ["history", "Validation History", History], ["reports", "Reports", FileText], ["settings", "Settings", Settings], ["help", "Help & Guidance", LifeBuoy]];
const admin = [["", "Overview", LayoutDashboard], ["rules", "Rule Library", Library], ["users", "User Management", Users], ["settings", "Settings", Settings]];
export default function Sidebar() {
  const { user } = useAuth(); const base = "/" + user.role;
  return <aside className="sidebar">{(user.role === "admin" ? admin : analyst).map(([p, l, Icon]) =>
    <NavLink key={p} end={p === ""} to={p ? `${base}/${p}` : base}><Icon size={17} strokeWidth={1.8} /><span>{l}</span></NavLink>)}</aside>;
}
