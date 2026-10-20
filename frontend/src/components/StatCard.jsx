export default function StatCard({ icon: Icon, label, value }) {
  return <div className="stat-card"><span className="icon">{Icon && <Icon size={20} strokeWidth={1.8} />}</span><div><p>{label}</p><h3>{value}</h3></div></div>;
}
