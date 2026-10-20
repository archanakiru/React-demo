import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, downloadValidation } from "../utils/api.js";
import Alert from "../components/Alert.jsx";
import ErrorTable from "../components/ErrorTable.jsx";

export default function DataValidation() {
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState(null);
  const [rules, setRules] = useState([]);
  const [sel, setSel] = useState([]);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/rules").then(setRules);
  }, []);

  const stage = res ? 5 : sel.length ? 4 : info ? 3 : 1;

  const upload = async () => {
    if (!file) return setErr("Choose a file first");

    setErr("");
    setBusy(true);
    setRes(null);
    setSel([]);

    const fd = new FormData();
    fd.append("file", file);

    try {
      setInfo(await api("/files/upload", { method: "POST", form: fd }));
    } catch (x) {
      setErr(x.message);
    }

    setBusy(false);
  };

  const validate = async () => {
    setErr("");
    setBusy(true);

    try {
      setRes(
        await api("/validate", {
          method: "POST",
          body: { file_id: info.file_id, rule_ids: sel },
        })
      );
    } catch (x) {
      setErr(x.message);
    }

    setBusy(false);
  };

  const toggle = (id) =>
    setSel(
      sel.includes(id)
        ? sel.filter((x) => x !== id)
        : [...sel, id]
    );

  const reset = () => {
    setFile(null);
    setInfo(null);
    setRes(null);
    setSel([]);
  };

  return (
    <div>
      <h2>Data Validation</h2>

      <div className="steps">
        {["Upload", "Preview", "Select rules", "Validate", "Flagged results"].map(
          (s, i) => (
            <span
              key={s}
              className={
                (info ? (res ? 5 : 3) : 1) >= i + 1 || stage >= i + 1
                  ? "on"
                  : ""
              }
            >
              {i + 1}. {s}
            </span>
          )
        )}
      </div>

      <Alert msg={err} />

      <section className="panel">
        <h3>1. Upload file</h3>

        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          className="btn primary"
          disabled={busy}
          onClick={upload}
        >
          {busy && !info ? "Uploading..." : "Upload"}
        </button>
      </section>

      {info && (
        <section className="panel">
          <h3>
            2. Preview — {info.filename} ({info.rows} rows,{" "}
            {info.columns.length} columns)
          </h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {info.columns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {info.preview.map((r, i) => (
                  <tr key={i}>
                    {info.columns.map((c) => (
                      <td key={c}>
                        {r[c] === null ? (
                          <i className="null">null</i>
                        ) : (
                          String(r[c])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {info && (
        <section className="panel">
          <h3>3. Select rules</h3>

          <div className="rule-list">
            {rules.map((r) => (
              <label
                key={r.id}
                className={sel.includes(r.id) ? "rule on" : "rule"}
              >
                <input
                  type="checkbox"
                  checked={sel.includes(r.id)}
                  onChange={() => toggle(r.id)}
                />
                <b>{r.name}</b>
                <small>{r.description}</small>
              </label>
            ))}
          </div>

          <button
            className="btn"
            onClick={() => setSel(rules.map((r) => r.id))}
          >
            Select all
          </button>

          <h3>4. Validate</h3>

          <button
            className="btn primary"
            disabled={busy || !sel.length}
            onClick={validate}
          >
            {busy ? "Validating..." : "Validate file"}
          </button>
        </section>
      )}

      {res && (
        <section className="panel">
          <h3>5. Flagged results</h3>

          <div className="cards small">
            <div className="stat-card">
              <div>
                <h3>{res.total_rows}</h3>
                <p>Rows</p>
              </div>
            </div>

            <div className="stat-card">
              <div>
                <h3>{res.error_count}</h3>
                <p>Errors</p>
              </div>
            </div>

            <div className="stat-card">
              <div>
                <h3>{res.completeness}%</h3>
                <p>Completeness</p>
              </div>
            </div>
          </div>

          <ErrorTable rows={res.errors} />

          <button
            className="btn primary"
            onClick={() =>
              downloadValidation(res.id).catch((x) => setErr(x.message))
            }
          >
            <Download size={14} /> Download flagged Excel
          </button>

          <button className="btn" onClick={reset}>
            Validate another file
          </button>{" "}

          <Link className="btn" to="/analyst/reports">
            Go to reports
          </Link>
        </section>
      )}
    </div>
  );
}