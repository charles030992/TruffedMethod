import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { TRUFFED_METHOD_ADDRESS, TRUFFED_METHOD_ABI } from "../contracts/truffedMethod";

export type Company = {
  id: number;
  ticker: string;
  name: string;
  sector: string;
  status: number;
  metadataURI: string;
  createdBy: string;
  exists: boolean;
};

export function useCompanies(refreshSignal?: unknown) {
  const publicClient = usePublicClient();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!publicClient) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextCompanyIdRaw = (await publicClient.readContract({
          address: TRUFFED_METHOD_ADDRESS,
          abi: TRUFFED_METHOD_ABI as any,
          functionName: "nextCompanyId",
          args: [],
        })) as bigint;

        const nextCompanyId = Number(nextCompanyIdRaw ?? 0n);
        const count = nextCompanyId === 0 ? 0 : Math.max(0, nextCompanyId - 1);

        if (count === 0) {
          if (mounted) setCompanies([]);
          return;
        }

        const ids = Array.from({ length: count }, (_, i) => i + 1);
        const client = publicClient;

        const results = await Promise.all(
          ids.map(async (id) => {
            const res = (await client.readContract({
              address: TRUFFED_METHOD_ADDRESS,
              abi: TRUFFED_METHOD_ABI as any,
              functionName: "companies",
              args: [BigInt(id)],
            })) as any;

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

  return { companies, loading, error };
}
