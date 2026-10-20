const faq = [
  [
    "How do I validate a file?",
    "Go to Data Validation → upload an .xlsx/.xls/.csv file → check the preview → select rules → click Validate. Download the flagged Excel afterwards.",
  ],
  [
    "What do the rules check?",
    "Null Check finds empty cells. Duplicate Rows finds repeated rows. Required Columns checks that mandatory columns exist. Outlier Detection uses the IQR method on numeric columns. Whitespace and Negative checks find stray spaces and negative numbers.",
  ],
  [
    "How are errors flagged in the Excel?",
    "Bad cells are highlighted red with a comment explaining the issue. An extra 'Errors' sheet lists every issue with row, column and rule.",
  ],
  [
    "What is completeness?",
    "The percentage of non-empty cells in your file.",
  ],
  [
    "Where are my past results?",
    "Validation History lists all runs; Reports keeps only the flagged ones with downloadable files.",
  ],
  [
    "Need a new rule?",
    "Ask an admin — they can add rules in the Rule Library and they appear instantly in your rule list.",
  ],
];

export default function Help() {
  return (
    <div>
      <h2>Help & Guidance</h2>

      <section className="panel">
        <h3>Quick start</h3>

        <ol>
          <li>Upload your Excel file.</li>
          <li>Preview the first 10 rows.</li>
          <li>Pick the rules to apply.</li>
          <li>Validate and review flagged errors.</li>
          <li>Download the flagged file.</li>
        </ol>
      </section>

      {faq.map(([q, a]) => (
        <details className="panel" key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}

      <section className="panel">
        <h3>Best practices</h3>

        <ul>
          <li>Keep the header in the first row.</li>
          <li>Use one sheet per file (first sheet is validated).</li>
          <li>Fix errors in the flagged file and re-validate.</li>
        </ul>
      </section>
    </div>
  );
}