import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../utils/api.js";
import Alert from "../components/Alert.jsx";

const empty = {
  name: "",
  type: "null_check",
  description: "",
  columns: "",
  active: true,
};

export default function RuleLibrary() {
  const [d, setD] = useState({ rules: [], types: [] });
  const [f, setF] = useState(empty);
  const [edit, setEdit] = useState(null);
  const [err, setErr] = useState("");

  const load = () => api("/admin/rules").then(setD);

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      await api(edit ? `/admin/rules/${edit}` : "/admin/rules", {
        method: edit ? "PUT" : "POST",
        body: f,
      });

      setF(empty);
      setEdit(null);
      load();
    } catch (x) {
      setErr(x.message);
    }
  };

  const del = async (id) => {
    if (confirm("Delete rule?")) {
      await api(`/admin/rules/${id}`, {
        method: "DELETE",
      });

      load();
    }
  };

  const flip = async (r) => {
    await api(`/admin/rules/${r.id}`, {
      method: "PUT",
      body: {
        name: r.name,
        type: r.type,
        description: r.description,
        columns: r.columns,
        active: !r.active,
      },
    });

    load();
  };

  return (
    <div>
      <h2>Rule Library</h2>

      <form className="panel form-row" onSubmit={save}>
        <h3>{edit ? "Edit rule" : "Add new rule"}</h3>

        <Alert msg={err} />

        <input
          placeholder="Rule name"
          required
          value={f.name}
          onChange={(e) =>
            setF({ ...f, name: e.target.value })
          }
        />

        <select
          value={f.type}
          onChange={(e) =>
            setF({ ...f, type: e.target.value })
          }
        >
          {d.types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <input
          placeholder="Columns (comma separated, blank = all)"
          value={f.columns}
          onChange={(e) =>
            setF({ ...f, columns: e.target.value })
          }
        />

        <input
          placeholder="Description"
          value={f.description}
          onChange={(e) =>
            setF({ ...f, description: e.target.value })
          }
        />

        <button className="btn primary">
          {edit ? "Update" : "Add rule"}
        </button>

        {edit && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              setEdit(null);
              setF(empty);
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Columns</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {d.rules.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.type}</td>
                <td>{r.columns || "all"}</td>
                <td>{r.description}</td>

                <td>
                  <span
                    className={
                      r.active ? "tag green" : "tag red"
                    }
                  >
                    {r.active ? "Active" : "Off"}
                  </span>
                </td>

                <td>
                  <button
                    className="btn sm"
                    onClick={() => {
                      setEdit(r.id);
                      setF({
                        name: r.name,
                        type: r.type,
                        description: r.description,
                        columns: r.columns,
                        active: !!r.active,
                      });
                      window.scrollTo(0, 0);
                    }}
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    className="btn sm"
                    onClick={() => flip(r)}
                  >
                    {r.active ? "Disable" : "Enable"}
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
          </tbody>
        </table>
      </div>
    </div>
  );
}