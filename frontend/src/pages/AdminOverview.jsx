import {
  CheckCircle2,
  FileText,
  Flag,
  Library,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../utils/api.js";
import StatCard from "../components/StatCard.jsx";

export default function AdminOverview() {
  const [s, setS] = useState(null);

  useEffect(() => {
    api("/admin/stats").then(setS);
  }, []);

  if (!s) return <p>Loading...</p>;

  return (
    <div>
      <h2>Admin Overview</h2>

      <div className="cards">
        <StatCard
          icon={Users}
          label="Total Analysts"
          value={s.analysts}
        />
        <StatCard
          icon={UserCheck}
          label="Active Analysts"
          value={s.active_analysts}
        />
        <StatCard
          icon={FileText}
          label="Total Reports (flagged)"
          value={s.reports}
        />
        <StatCard
          icon={CheckCircle2}
          label="Validations Run"
          value={s.validations}
        />
        <StatCard
          icon={Flag}
          label="Errors Found"
          value={s.errors}
        />
        <StatCard
          icon={Library}
          label="Active Rules"
          value={s.rules}
        />
      </div>

      <div className="grid2">
        <section className="panel">
          <h3>Analyst activity</h3>

          {s.analyst_list.map((a) => (
            <div className="recent" key={a.email}>
              <span>
                <b>{a.name}</b>
                <br />
                <small>
                  {a.email} • {a.files} files • last active{" "}
                  {a.last_active || "never"}
                </small>
              </span>

              <span className={a.active ? "tag green" : "tag red"}>
                {a.active ? "Active" : "Disabled"}
              </span>
            </div>
          ))}

          {!s.analyst_list.length && (
            <p className="muted">No analysts yet.</p>
          )}
        </section>

        <section className="panel">
          <h3>Recent validations</h3>

          {s.recent.map((v, i) => (
            <div className="recent" key={i}>
              <span>
                {v.file_name}
                <br />
                <small>
                  {v.name} • {v.created_at}
                </small>
              </span>

              <span className={v.error_count ? "tag red" : "tag green"}>
                {v.error_count} errors
              </span>
            </div>
          ))}

          {!s.recent.length && (
            <p className="muted">No activity yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}