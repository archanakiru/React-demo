import { Download, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  api,
  downloadValidation,
} from "../utils/api.js";

export default function ValidationHistory() {
  const [rows, setRows] = useState(null);
  const [f, setF] = useState("");

  const load = () => api("/validations").then(setRows);

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (confirm("Delete this record?")) {
      await api(`/validations/${id}`, {
        method: "DELETE",
      });

      load();
    }
  };

  if (!rows) {
    return <p>Loading...</p>;
  }

  const list = rows.filter((r) =>
    r.file_name.toLowerCase().includes(f.toLowerCase())
  );

  return (
    <div>
      <h2>Validation History</h2>

      <input
        className="filter"
        placeholder="Filter by file name..."
        value={f}
        onChange={(e) => setF(e.target.value)}
      />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>File</th>
              <th>Date</th>
              <th>Rows</th>
              <th>Rules applied</th>
              <th>Errors</th>
              <th>Completeness</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.file_name}</td>
                <td>{r.created_at}</td>
                <td>{r.total_rows}</td>
                <td>{r.rules.join(", ")}</td>
                <td>{r.error_count}</td>
                <td>{r.completeness}%</td>

                <td>
                  <span
                    className={
                      r.error_count ? "tag red" : "tag green"
                    }
                  >
                    {r.error_count ? "Flagged" : "Clean"}
                  </span>
                </td>

                <td>
                  <button
                    className="btn sm"
                    onClick={() => downloadValidation(r.id)}
                  >
                    <Download size={14} />
                  </button>

                  <button
                    className="btn sm danger"
                    onClick={() => del(r.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {!list.length && (
              <tr>
                <td colSpan="9" className="muted">
                  No validations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}