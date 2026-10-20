export default function ErrorTable({ rows }) {
  if (!rows.length) return <p className="muted">No errors found.</p>;
  return <div className="table-wrap"><table><thead><tr><th>Row</th><th>Column</th><th>Rule</th><th>Issue</th></tr></thead>
    <tbody>{rows.map((e, i) => <tr key={i}><td>{e.row}</td><td>{e.column}</td><td>{e.rule}</td><td>{e.issue}</td></tr>)}</tbody></table>
    {rows.length >= 200 && <p className="muted">Showing first 200. Download the file for all errors.</p>}</div>;
}
