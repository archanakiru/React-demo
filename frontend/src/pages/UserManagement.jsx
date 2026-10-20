import { ShieldCheck, UserCheck, UserX, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../utils/api.js";
import StatCard from "../components/StatCard.jsx";
import Alert from "../components/Alert.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    role: "analyst",
  });
  const [err, setErr] = useState("");

  const { user: me } = useAuth();

  const load = () => api("/admin/users").then(setUsers);

  useEffect(() => {
    load();
  }, []);

  const act = async (fn) => {
    setErr("");

    try {
      await fn();
      load();
    } catch (x) {
      setErr(x.message);
    }
  };

  const add = (e) => {
    e.preventDefault();

    act(async () => {
      await api("/admin/users", {
        method: "POST",
        body: f,
      });

      setF({
        name: "",
        email: "",
        password: "",
        role: "analyst",
      });
    });
  };

  const n = (fn) => users.filter(fn).length;

  return (
    <div>
      <h2>User Management</h2>

      <Alert msg={err} />

      <div className="cards">
        <StatCard
          icon={Users}
          label="Data Analysts"
          value={n((u) => u.role === "analyst")}
        />

        <StatCard
          icon={ShieldCheck}
          label="Admins"
          value={n((u) => u.role === "admin")}
          color="#7c3aed"
        />

        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={n((u) => u.active)}
          color="#16a34a"
        />

        <StatCard
          icon={UserX}
          label="Disabled"
          value={n((u) => !u.active)}
          color="#dc2626"
        />
      </div>

      <form className="panel form-row" onSubmit={add}>
        <h3>Add user</h3>

        <input
          placeholder="Name"
          required
          value={f.name}
          onChange={(e) =>
            setF({ ...f, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          required
          value={f.email}
          onChange={(e) =>
            setF({ ...f, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={f.password}
          onChange={(e) =>
            setF({ ...f, password: e.target.value })
          }
        />

        <select
          value={f.role}
          onChange={(e) =>
            setF({ ...f, role: e.target.value })
          }
        >
          <option>analyst</option>
          <option>admin</option>
        </select>

        <button className="btn primary">Add</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Created</th>
              <th>Status</th>
              <th>Last active</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.role}</td>
                <td>{u.email}</td>
                <td>{u.created_at}</td>

                <td>
                  <span
                    className={
                      u.active ? "tag green" : "tag red"
                    }
                  >
                    {u.active ? "Active" : "Disabled"}
                  </span>
                </td>

                <td>{u.last_active || "—"}</td>

                <td>
                  {u.id !== me.id ? (
                    <>
                      <button
                        className="btn sm"
                        onClick={() =>
                          act(() =>
                            api(`/admin/users/${u.id}`, {
                              method: "PUT",
                              body: { active: !u.active },
                            })
                          )
                        }
                      >
                        {u.active
                          ? "Revoke access"
                          : "Give access"}
                      </button>

                      <button
                        className="btn sm"
                        onClick={() =>
                          act(() =>
                            api(`/admin/users/${u.id}`, {
                              method: "PUT",
                              body: {
                                role:
                                  u.role === "admin"
                                    ? "analyst"
                                    : "admin",
                              },
                            })
                          )
                        }
                      >
                        Make{" "}
                        {u.role === "admin"
                          ? "analyst"
                          : "admin"}
                      </button>

                      <button
                        className="btn sm danger"
                        onClick={() =>
                          confirm("Remove user?") &&
                          act(() =>
                            api(`/admin/users/${u.id}`, {
                              method: "DELETE",
                            })
                          )
                        }
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <small>(you)</small>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}