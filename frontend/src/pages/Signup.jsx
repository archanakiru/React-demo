import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "../utils/api.js";
import Alert from "../components/Alert.jsx";
import AuthShell from "../components/AuthShell.jsx";

export default function Signup() {
  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (f.password !== f.confirm) {
      return setErr("Passwords do not match");
    }

    try {
      await api("/auth/signup", {
        method: "POST",
        body: {
          name: f.name,
          email: f.email,
          password: f.password,
        },
      });

      alert("Account created! Please log in.");
      nav("/login");
    } catch (x) {
      setErr(x.message);
    }
  };

  const s = (k) => (e) =>
    setF({ ...f, [k]: e.target.value });

  return (
    <AuthShell
      eyebrow="GET STARTED"
      title="Create your account"
      subtitle="Sign up as a data analyst."
    >
      <form onSubmit={submit}>
        <Alert msg={err} />

        <label>Full name</label>
        <input
          placeholder="Jane Doe"
          required
          value={f.name}
          onChange={s("name")}
        />

        <label>Work email</label>
        <input
          type="email"
          placeholder="you@company.com"
          required
          value={f.email}
          onChange={s("email")}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Min 6 characters"
          required
          value={f.password}
          onChange={s("password")}
        />

        <label>Confirm password</label>
        <input
          type="password"
          placeholder="Re-enter password"
          required
          value={f.confirm}
          onChange={s("confirm")}
        />

        <button className="btn primary block">
          Create account <ArrowRight size={16} />
        </button>

        <p className="center">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}