import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Flag,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api.js";
import StatCard from "../components/StatCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AnalystOverview() {
  const [s, setS] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    api("/stats").then(setS);
  }, []);

  if (!s) return <p>Loading...</p>;

  const max = Math.max(1, ...Object.values(s.by_rule));

  return (
    <div>
      <h2>Welcome back, {user.name}</h2>

      <div className="cards">
        <StatCard
          icon={FileSpreadsheet}
          label="Files Validated"
          value={s.files}
        />
        <StatCard
          icon={Flag}
          label="Total Errors"
          value={s.errors}
        />
        <StatCard
          icon={CheckCircle2}
          label="Avg Completeness"
          value={s.completeness + "%"}
        />
        <StatCard
          icon={AlertTriangle}
          label="Flagged Files"
          value={s.flagged}
        />
        <StatCard
          icon={ShieldCheck}
          label="Clean Files"
          value={s.clean}
        />
      </div>

      <div className="grid2">
        <section className="panel">
          <h3>Errors by rule</h3>

          {Object.keys(s.by_rule).length ? (
            Object.entries(s.by_rule).map(([k, v]) => (
              <div className="bar-row" key={k}>
                <span>{k}</span>

                <div className="bar">
                  <i style={{ width: (v / max) * 100 + "%" }} />
                </div>

                <b>{v}</b>
              </div>
            ))
          ) : (
            <p className="muted">No data yet.</p>
          )}
        </section>

        <section className="panel">
          <h3>Recent validations</h3>

          {s.recent.length ? (
            s.recent.map((v) => (
              <div className="recent" key={v.id}>
                <span>{v.file_name}</span>

                <span
                  className={v.error_count ? "tag red" : "tag green"}
                >
                  {v.error_count} errors
                </span>
              </div>
            ))
          ) : (
            <p className="muted">Nothing validated yet.</p>
          )}

          <Link className="btn primary" to="/analyst/validation">
            + New validation
          </Link>
        </section>
      </div>
    </div>
  );
}