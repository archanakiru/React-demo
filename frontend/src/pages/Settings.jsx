import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { api } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";

export default function Settings() {
  const { user, update } = useAuth();

  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ old: "", nw: "" });
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const run = async (fn) => {
    setMsg("");
    setErr("");

    try {
      setMsg(await fn());
    } catch (x) {
      setErr(x.message);
    }
  };

  const saveName = () =>
    run(async () => {
      const d = await api("/auth/profile", {
        method: "PUT",
        body: { name },
      });

      update({ ...user, name });

      return d.message;
    });

  const changePw = () =>
    run(async () => {
      const d = await api("/auth/change-password", {
        method: "POST",
        body: {
          old_password: pw.old,
          new_password: pw.nw,
        },
      });

      setPw({ old: "", nw: "" });

      return d.message;
    });

  const setT = (t) => {
    setTheme(t);
    localStorage.setItem("theme", t);
    document.documentElement.dataset.theme = t;
  };

  return (
    <div>
      <h2>Settings</h2>

      <Alert msg={err} />
      <Alert msg={msg} type="success" />

      <div className="grid2">
        <section className="panel">
          <h3>Profile</h3>

          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email</label>
          <input value={user.email} disabled />

          <label>Role</label>
          <input value={user.role} disabled />

          <label>Member since</label>
          <input value={user.created_at} disabled />

          <button
            className="btn primary"
            onClick={saveName}
          >
            Save profile
          </button>
        </section>

        <div>
          <section className="panel">
            <h3>Theme</h3>

            <button
              className={
                "btn " + (theme === "light" ? "primary" : "")
              }
              onClick={() => setT("light")}
            >
              <Sun size={14} /> Light
            </button>

            <button
              className={
                "btn " + (theme === "dark" ? "primary" : "")
              }
              onClick={() => setT("dark")}
            >
              <Moon size={14} /> Dark
            </button>
          </section>

          <section className="panel">
            <h3>Password reset</h3>

            <input
              type="password"
              placeholder="Current password"
              value={pw.old}
              onChange={(e) =>
                setPw({ ...pw, old: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="New password"
              value={pw.nw}
              onChange={(e) =>
                setPw({ ...pw, nw: e.target.value })
              }
            />

            <button
              className="btn primary"
              onClick={changePw}
            >
              Change password
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}