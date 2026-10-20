export default function Alert({ msg, type = "error" }) { return msg ? <div className={`alert ${type}`}>{msg}</div> : null; }
