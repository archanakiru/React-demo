import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { api } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";
import AuthShell from "../components/AuthShell.jsx";

export default function Login() {
  const [f, setF] = useState({
    email: localStorage.getItem("remember") || "",
    password: "",
  });

  const [role, setRole] = useState("analyst");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);
  const [rem, setRem] = useState(!!localStorage.getItem("remember"));
  const [help, setHelp] = useState(false);

  const { login, user } = useAuth();
  const nav = useNavigate();

  if (user) {
    setTimeout(() => nav(`/${user.role}`), 0);
  }

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const d = await api("/auth/login", {
        method: "POST",
        body: { ...f, role },
      });

      rem
        ? localStorage.setItem("remember", f.email)
        : localStorage.removeItem("remember");

      login(d.token, d.user);
      nav(`/${d.user.role}`);
    } catch (x) {
      setErr(x.message);
    }
  };

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Sign in to your workspace"
      subtitle="Enter your account details to continue."
    >
      <form onSubmit={submit}>
        <div className="role-switch">
          <button
            type="button"
            className={role === "analyst" ? "on" : ""}
            onClick={() => setRole("analyst")}
          >
            <FileText size={16} /> Data analyst
          </button>

          <button
            type="button"
            className={role === "admin" ? "on" : ""}
            onClick={() => setRole("admin")}
          >
            <ShieldCheck size={16} /> Administrator
          </button>
        </div>

        <Alert msg={err} />

        <label>Work email</label>
        <input
          type="email"
          placeholder="you@company.com"
          required
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />

        <label>Password</label>
        <div className="pw">
          <input
            type={show ? "text" : "password"}
            placeholder="Enter your password"
            required
            value={f.password}
            onChange={(e) =>
              setF({ ...f, password: e.target.value })
            }
          />

          <button type="button" onClick={() => setShow(!show)}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="row-between">
          <label className="check">
            <input
              type="checkbox"
              checked={rem}
              onChange={(e) => setRem(e.target.checked)}
            />
            Remember me
          </label>

          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button className="btn primary block">
          Sign in <ArrowRight size={16} />
        </button>

        <p className="center">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>

      <div className="helpbox">
        <button type="button" onClick={() => setHelp(!help)}>
          <HelpCircle size={16} /> Need help? <ChevronDown size={14} />
        </button>

        {help && (
          <div>
            <b>Having trouble signing in?</b>

            <ul>
              <li>Check that your email and password are correct.</li>
              <li>Make sure you picked the right role tab.</li>
              <li>Use "Forgot password?" to reset your password.</li>
              <li>
                Contact an administrator if your access was disabled.
              </li>
            </ul>
          </div>
        )}
      </div>
    </AuthShell>
  );
}