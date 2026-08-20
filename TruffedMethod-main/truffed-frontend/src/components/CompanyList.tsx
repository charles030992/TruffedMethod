import { useCompanies } from "../hooks/useCompanies";
import { COMPANY_STATUS_LABELS } from "../contracts/companyStatus";

export function CompanyList({ refreshSignal }: { refreshSignal?: unknown }) {
  const { companies, loading, error } = useCompanies(refreshSignal);

  return (
    <section style={{ marginTop: "1rem", border: "1px solid #333", borderRadius: 12, padding: "1rem" }}>
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Companies</h2>

      {loading && <p style={{ opacity: 0.85 }}>Loading companies...</p>}
      {error && (
        <p style={{ color: "#f97373" }}>Error loading companies: {error}</p>
      )}

      {!loading && companies.length === 0 && (
        <p style={{ opacity: 0.8 }}>No companies registered yet.</p>
      )}

      {companies.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ textAlign: "left", color: "#c7d2fe" }}>
              <tr>
                <th style={{ padding: "0.5rem" }}>Ticker</th>
                <th style={{ padding: "0.5rem" }}>Name</th>
                <th style={{ padding: "0.5rem" }}>Status</th>
                <th style={{ padding: "0.5rem" }}>Sector</th>
                <th style={{ padding: "0.5rem" }}>Created By</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid #2b2b2b" }}>
                  <td style={{ padding: "0.5rem", fontFamily: "monospace" }}>{c.ticker}</td>
                  <td style={{ padding: "0.5rem" }}>{c.name}</td>
                  <td style={{ padding: "0.5rem" }}>{COMPANY_STATUS_LABELS[c.status] ?? c.status}</td>
                  <td style={{ padding: "0.5rem" }}>{c.sector}</td>
                  <td style={{ padding: "0.5rem", fontFamily: "monospace" }}>{c.createdBy.slice(0,6)}...{c.createdBy.slice(-4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
