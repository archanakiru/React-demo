import { ShieldCheck } from "lucide-react";
export default function AuthShell({ eyebrow, title, subtitle, children }) {
  return <div className="auth-page">
    <section className="auth-hero">
      <div className="brand light"><span className="logo"><ShieldCheck size={20} /></span>Clear<b>DQ</b></div>
      <div className="hero-copy"><span className="pill">DATA QUALITY, MADE CLEAR</span>
        <h1>Trust your data.<br /><em>Make better decisions.</em></h1>
        <p>One workspace to validate datasets, standardize quality rules, and turn data issues into actionable insights.</p>
        <div className="hero-stats"><div><b>5+</b><span>Quality dimensions</span></div><div><b>1 place</b><span>For every validation</span></div></div></div>
    </section>
    <section className="auth-side"><div className="auth-card"><small className="eyebrow">{eyebrow}</small><h2>{title}</h2><p className="muted">{subtitle}</p>{children}</div></section>
  </div>;
}
