import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { TRUFFED_METHOD_ADDRESS, TRUFFED_METHOD_ABI } from "../contracts/truffedMethod";
import { COMPANY_STATUS_LABELS } from "../contracts/companyStatus";
import { useCompanies } from "../hooks/useCompanies";

type Proposal = {
  id: number;
  companyId: number;
  proposedStatus: number;
  descriptionURI: string;
  yesVotes: number;
  noVotes: number;
  startTime: number;
  endTime: number;
  executed: boolean;
};

function actionButtonStyle(disabled: boolean, color: string): CSSProperties {
  return {
    padding: "0.4rem 0.9rem",
    borderRadius: "9999px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    backgroundColor: disabled ? "#555" : color,
    color: "#000",
    fontWeight: 600,
    fontSize: "0.85rem",
  };
}

export function ProposalList({
  refreshSignal,
  onChanged,
}: {
  refreshSignal?: unknown;
  onChanged?: () => void;
}) {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { companies } = useCompanies(refreshSignal);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [votedMap, setVotedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync, isPending } = useWriteContract();
  const [pendingAction, setPendingAction] = useState<
    { type: "vote" | "execute"; proposalId: number } | null
  >(null);
  const [actionError, setActionError] = useState<{ proposalId: number; message: string } | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!publicClient) return;

      setLoading(true);
      setError(null);

      try {
        const nextProposalIdRaw = (await publicClient.readContract({
          address: TRUFFED_METHOD_ADDRESS,
          abi: TRUFFED_METHOD_ABI as any,
          functionName: "nextProposalId",
          args: [],
        })) as bigint;

        const count = Number(nextProposalIdRaw ?? 0n);

        if (count === 0) {
          if (mounted) setProposals([]);
          return;
        }

        const ids = Array.from({ length: count }, (_, i) => i + 1);
        const client = publicClient;

        const results = await Promise.all(
          ids.map(async (id) => {
            const res = (await client.readContract({
              address: TRUFFED_METHOD_ADDRESS,
              abi: TRUFFED_METHOD_ABI as any,
              functionName: "getProposal",
              args: [BigInt(id)],
            })) as any;

            const [pid, companyId, proposedStatus, descriptionURI, yesVotes, noVotes, startTime, endTime, executed] = res;

            return {
              id: Number(pid ?? id),
              companyId: Number(companyId ?? 0n),
              proposedStatus: Number(proposedStatus ?? 0),
              descriptionURI: String(descriptionURI ?? ""),
              yesVotes: Number(yesVotes ?? 0n),
              noVotes: Number(noVotes ?? 0n),
              startTime: Number(startTime ?? 0n),
              endTime: Number(endTime ?? 0n),
              executed: Boolean(executed),
            } as Proposal;
          })
        );

        if (mounted) setProposals(results);

        if (address) {
          const votedResults = await Promise.all(
            results.map(async (p) => {
              const voted = (await client.readContract({
                address: TRUFFED_METHOD_ADDRESS,
                abi: TRUFFED_METHOD_ABI as any,
                functionName: "hasVoted",
                args: [BigInt(p.id), address],
              })) as boolean;
              return [p.id, voted] as const;
            })
          );
          if (mounted) setVotedMap(Object.fromEntries(votedResults));
        } else if (mounted) {
          setVotedMap({});
        }
      } catch (err: any) {
        console.error("Error loading proposals", err);
        if (mounted) setError(String(err?.message ?? err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [publicClient, address, refreshSignal, isConfirmed]);

  useEffect(() => {
    if (isConfirmed) {
      onChanged?.();
      setPendingAction(null);
      setTxHash(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);

  async function handleVote(proposalId: number, support: boolean) {
    if (!address) {
      alert("Conecta tu wallet para votar.");
      return;
    }

    setActionError(null);
    try {
      setPendingAction({ type: "vote", proposalId });
      const hash = await writeContractAsync({
        address: TRUFFED_METHOD_ADDRESS,
        abi: TRUFFED_METHOD_ABI as any,
        functionName: "vote",
        args: [BigInt(proposalId), support],
      });
      setTxHash(hash);
    } catch (err: any) {
      console.error("Error voting:", err);
      setActionError({ proposalId, message: String(err?.shortMessage ?? err?.message ?? err) });
      setPendingAction(null);
    }
  }

  async function handleExecute(proposalId: number) {
    setActionError(null);
    try {
      setPendingAction({ type: "execute", proposalId });
      const hash = await writeContractAsync({
        address: TRUFFED_METHOD_ADDRESS,
        abi: TRUFFED_METHOD_ABI as any,
        functionName: "executeProposal",
        args: [BigInt(proposalId)],
      });
      setTxHash(hash);
    } catch (err: any) {
      console.error("Error executing proposal:", err);
      setActionError({ proposalId, message: String(err?.shortMessage ?? err?.message ?? err) });
      setPendingAction(null);
    }
  }

  const companyTicker = (companyId: number) =>
    companies.find((c) => c.id === companyId)?.ticker ?? `#${companyId}`;

  const now = Math.floor(Date.now() / 1000);

  return (
    <section style={{ marginTop: "1.5rem", border: "1px solid #333", borderRadius: 12, padding: "1rem" }}>
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Proposals</h2>

      {loading && <p style={{ opacity: 0.85 }}>Loading proposals...</p>}
      {error && <p style={{ color: "#f97373" }}>Error loading proposals: {error}</p>}
      {!loading && proposals.length === 0 && <p style={{ opacity: 0.8 }}>No proposals yet.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {proposals.map((p) => {
          const totalVotes = p.yesVotes + p.noVotes;
          const yesPct = totalVotes > 0 ? Math.round((p.yesVotes * 100) / totalVotes) : 0;
          const votingOpen = now <= p.endTime && !p.executed;
          const canExecute = !p.executed && now > p.endTime;
          const alreadyVoted = votedMap[p.id];
          const isThisPending =
            pendingAction?.proposalId === p.id && (isPending || isConfirming);

          return (
            <div key={p.id} style={{ border: "1px solid #2b2b2b", borderRadius: 10, padding: "0.75rem 1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <strong>#{p.id} · {companyTicker(p.companyId)}</strong>
                <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                  {p.executed ? "✅ Executed" : votingOpen ? "🗳 Voting open" : "⏳ Voting ended"}
                </span>
              </div>

              <p style={{ fontSize: "0.9rem", margin: "0.35rem 0" }}>
                Proposes: <strong>{COMPANY_STATUS_LABELS[p.proposedStatus] ?? p.proposedStatus}</strong>
              </p>

              {p.descriptionURI && (
                <p style={{ fontSize: "0.85rem", opacity: 0.85 }}>
                  Details:{" "}
                  <a href={p.descriptionURI} target="_blank" rel="noreferrer" style={{ color: "#60a5fa" }}>
                    {p.descriptionURI}
                  </a>
                </p>
              )}

              <p style={{ fontSize: "0.85rem", opacity: 0.85 }}>
                Votes: {p.yesVotes} yes / {p.noVotes} no ({totalVotes} total, {yesPct}% yes)
              </p>
              <p style={{ fontSize: "0.75rem", opacity: 0.65 }}>
                Ends: {new Date(p.endTime * 1000).toLocaleString()}
              </p>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", alignItems: "center" }}>
                {votingOpen && (
                  <>
                    <button
                      onClick={() => handleVote(p.id, true)}
                      disabled={!address || alreadyVoted || isThisPending}
                      style={actionButtonStyle(!address || alreadyVoted || isThisPending, "#4ade80")}
                    >
                      {isThisPending && pendingAction?.type === "vote" ? "Voting..." : "Yes"}
                    </button>
                    <button
                      onClick={() => handleVote(p.id, false)}
                      disabled={!address || alreadyVoted || isThisPending}
                      style={actionButtonStyle(!address || alreadyVoted || isThisPending, "#f87171")}
                    >
                      {isThisPending && pendingAction?.type === "vote" ? "Voting..." : "No"}
                    </button>
                    {alreadyVoted && (
                      <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>You already voted</span>
                    )}
                  </>
                )}

                {canExecute && (
                  <button
                    onClick={() => handleExecute(p.id)}
                    disabled={isThisPending}
                    style={actionButtonStyle(isThisPending, "#818cf8")}
                  >
                    {isThisPending && pendingAction?.type === "execute" ? "Executing..." : "Execute"}
                  </button>
                )}
              </div>

              {actionError?.proposalId === p.id && (
                <p style={{ fontSize: "0.8rem", color: "#f97373", marginTop: "0.4rem" }}>
                  ⚠ {actionError.message}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
