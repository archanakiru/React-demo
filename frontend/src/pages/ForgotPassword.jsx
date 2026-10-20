import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "../utils/api.js";
import Alert from "../components/Alert.jsx";
import AuthShell from "../components/AuthShell.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");

  const [step, setStep] = useState(1);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const send = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const d = await api("/auth/forgot", {
        method: "POST",
        body: { email },
      });

      setOk(`${d.message}: ${d.reset_token}`);
      setStep(2);
    } catch (x) {
      setErr(x.message);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const d = await api("/auth/reset", {
        method: "POST",
        body: {
          email,
          token: code,
          new_password: pw,
        },
      });

      setOk(d.message);
      setStep(3);
    } catch (x) {
      setErr(x.message);
    }
  };

  return (
    <AuthShell
      eyebrow="ACCOUNT RECOVERY"
      title="Reset your password"
      subtitle="We'll generate a reset code for your account."
    >
      <form onSubmit={step === 1 ? send : reset}>
        <Alert msg={err} />
        <Alert msg={ok} type="success" />

        {step === 1 && (
          <>
            <label>Registered email</label>
            <input
              type="email"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className="btn primary block">
              Get reset code <ArrowRight size={16} />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label>Reset code</label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <label>New password</label>
            <input
              type="password"
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />

            <button className="btn primary block">
              Reset password <ArrowRight size={16} />
            </button>
          </>
        )}

        <p className="center">
          <Link to="/login">Back to sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}