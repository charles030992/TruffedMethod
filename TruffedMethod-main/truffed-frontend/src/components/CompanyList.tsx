import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { TRUFFED_METHOD_ADDRESS, TRUFFED_METHOD_ABI } from "../contracts/truffedMethod";

type Company = {
  id: number;
  ticker: string;
  name: string;
  sector: string;
  status: number;
  metadataURI: string;
  createdBy: string;
  exists: boolean;
};

export function CompanyList({ refreshSignal }: { refreshSignal?: unknown }) {
  const publicClient = usePublicClient();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const nextCompanyIdRaw = (await publicClient.readContract({
          address: TRUFFED_METHOD_ADDRESS as `0x${string}`,
          abi: TRUFFED_METHOD_ABI as any,
          functionName: "nextCompanyId",
        })) as bigint;

        const nextCompanyId = Number(nextCompanyIdRaw ?? 0n);

        // According to the contract, nextCompanyId starts at 1 and increments;
        // if nextCompanyId === 0 -> no companies
        const count = nextCompanyId === 0 ? 0 : Math.max(0, nextCompanyId - 1);

        if (count === 0) {
          if (mounted) setCompanies([]);
          return;
        }

        const ids = Array.from({ length: count }, (_, i) => i + 1);

        const results = await Promise.all(
          ids.map(async (id) => {
            const res = (await publicClient.readContract({
              address: TRUFFED_METHOD_ADDRESS as `0x${string}`,
              abi: TRUFFED_METHOD_ABI as any,
              functionName: "companies",
              args: [BigInt(id)],
            })) as any;

            // ABI returns tuple-like result: map to our shape
            const [cid, ticker, name, sector, status, metadataURI, createdBy, exists] = res;

            return {
              id: Number(cid ?? id),
              ticker: String(ticker ?? ""),
              name: String(name ?? ""),
              sector: String(sector ?? ""),
              status: Number(status ?? 0n),
              metadataURI: String(metadataURI ?? ""),
              createdBy: String(createdBy ?? ""),
              exists: Boolean(exists),
            } as Company;
          })
        );

        if (mounted) setCompanies(results);
      } catch (err: any) {
        console.error("Error loading companies", err);
        if (mounted) setError(String(err?.message ?? err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [publicClient, refreshSignal]);

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
                  <td style={{ padding: "0.5rem" }}>{["Value","Trading","Overvalued"][c.status] ?? c.status}</td>
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
