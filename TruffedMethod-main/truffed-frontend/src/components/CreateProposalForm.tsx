// src/components/CreateProposalForm.tsx
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { TRUFFED_METHOD_ADDRESS, TRUFFED_METHOD_ABI } from "../contracts/truffedMethod";
import { COMPANY_STATUS_TO_UINT } from "../contracts/companyStatus";
import type { CompanyStatusKey } from "../contracts/companyStatus";
import { useCompanies } from "../hooks/useCompanies";

export function CreateProposalForm({
  refreshSignal,
  onCreate,
}: {
  refreshSignal?: unknown;
  onCreate?: () => void;
}) {
  const { address } = useAccount();
  const { companies } = useCompanies(refreshSignal);
  const { writeContractAsync, isPending, error } = useWriteContract();

  const [companyId, setCompanyId] = useState("");
  const [proposedStatus, setProposedStatus] = useState<CompanyStatusKey>("VALUE");
  const [descriptionURI, setDescriptionURI] = useState("");
  const [durationDays, setDurationDays] = useState("3");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isConfirmed) {
      onCreate?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!address) {
      alert("Conecta primero tu wallet para crear una propuesta.");
      return;
    }

    const days = Number(durationDays);
    if (!companyId || !descriptionURI.trim() || !days || days <= 0) {
      alert("Por favor, rellena todos los campos.");
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: TRUFFED_METHOD_ADDRESS,
        abi: TRUFFED_METHOD_ABI as any,
        functionName: "createProposal",
        args: [
          BigInt(companyId),
          COMPANY_STATUS_TO_UINT[proposedStatus],
          descriptionURI.trim(),
          BigInt(Math.floor(days * 86400)),
        ],
      });

      setTxHash(hash);
      setDescriptionURI("");
      setDurationDays("3");
    } catch (err) {
      console.error("Error creating proposal:", err);
    }
  }

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1.5rem",
        border: "1px solid #333",
        borderRadius: "12px",
        maxWidth: "600px",
      }}
    >
      <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>
        Create a new proposal
      </h2>
      <p style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "1rem" }}>
        Propose a status change for a registered company, backed by a link to your analysis.
      </p>

      {!address && (
        <p style={{ color: "#f97373", marginBottom: "1rem" }}>
          🔌 Conecta tu wallet para poder crear propuestas.
        </p>
      )}

      {companies.length === 0 && (
        <p style={{ opacity: 0.8, marginBottom: "1rem" }}>
          No hay empresas registradas todavía. Crea una empresa antes de proponer un cambio de estado.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          Company
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #555" }}
          >
            <option value="">Select a company...</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.ticker} — {c.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          Proposed status
          <select
            value={proposedStatus}
            onChange={(e) => setProposedStatus(e.target.value as CompanyStatusKey)}
            style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #555" }}
          >
            <option value="VALUE">Value Investing</option>
            <option value="TRADING">Trading</option>
            <option value="OVERVALUED">Overvalued</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          Description URI (link a tu informe{" "}
          <a
            href="https://github.com/charles030992/truffhed-method"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#60a5fa" }}
          >
            Truffhed
          </a>
          {" "}actualizado)
          <input
            type="text"
            value={descriptionURI}
            onChange={(e) => setDescriptionURI(e.target.value)}
            placeholder="https://... o ipfs://... (informe .md que justifica el cambio de estado)"
            style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #555" }}
          />
        </label>
        <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "-0.4rem" }}>
          El estado propuesto debe corresponder a la nueva conclusión de Valoración del informe, no a una intuición sin respaldo.
        </p>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          Voting duration (days)
          <input
            type="number"
            min={1}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #555" }}
          />
        </label>

        <button
          type="submit"
          disabled={isPending || isConfirming || !address || companies.length === 0}
          style={{
            marginTop: "0.5rem",
            padding: "0.6rem 1rem",
            borderRadius: "9999px",
            border: "none",
            cursor:
              isPending || isConfirming || !address || companies.length === 0
                ? "not-allowed"
                : "pointer",
            backgroundColor:
              isPending || isConfirming || !address || companies.length === 0
                ? "#555"
                : "#4ade80",
            color: "#000",
            fontWeight: 600,
          }}
        >
          {isPending ? "Sending transaction..." : isConfirming ? "Confirming..." : "Create proposal"}
        </button>
      </form>
      {error && (
        <p style={{ marginTop: "0.75rem", color: "#f97373", fontSize: "0.85rem" }}>
          ⚠ Error: {error.message}
        </p>
      )}

      {txHash && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
          {isConfirmed ? "✅ Confirmed" : "⏳ Pending"}. Check on Etherscan:{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#60a5fa" }}
          >
            {txHash.slice(0, 10)}...
          </a>
        </p>
      )}
    </div>
  );
}
