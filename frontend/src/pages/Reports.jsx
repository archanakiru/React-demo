import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { api, downloadValidation } from "../utils/api.js";
import ErrorTable from "../components/ErrorTable.jsx";

export default function Reports() {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(null);
  const [errs, setErrs] = useState([]);

  useEffect(() => {
    api("/validations").then((d) =>
      setRows(d.filter((v) => v.error_count > 0))
    );
  }, []);

  const view = async (id) => {
    if (open === id) return setOpen(null);

    setErrs(await api(`/validations/${id}/errors`));
    setOpen(id);
  };

  if (!rows) return <p>Loading...</p>;

  return (
    <div>
      <h2>Flagged Reports</h2>

      {!rows.length && (
        <p className="muted">No flagged reports yet.</p>
      )}

      {rows.map((r) => (
        <section className="panel" key={r.id}>
          <div className="report-head">
            <div>
              <h3>{r.file_name}</h3>
              <small>
                {r.created_at} • {r.error_count} errors •{" "}
                {Object.entries(r.errors_by_rule)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")}
              </small>
            </div>

            <div>
              <button
                className="btn sm"
                onClick={() => view(r.id)}
              >
                {open === r.id ? "Hide" : "View errors"}
              </button>

              <button
                className="btn sm primary"
                onClick={() => downloadValidation(r.id)}
              >
                <Download size={14} /> Download
              </button>
            </div>
          </div>

          {open === r.id && <ErrorTable rows={errs} />}
        </section>
      ))}
    </div>
  );
}