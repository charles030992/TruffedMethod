// src/components/CreateCompanyForm.tsx
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { TRUFFED_METHOD_ADDRESS, TRUFFED_METHOD_ABI } from "../contracts/truffedMethod";
import { COMPANY_STATUS_TO_UINT } from "../contracts/companyStatus";
import type { CompanyStatusKey } from "../contracts/companyStatus";

type CompanyStatus = CompanyStatusKey;

export function CreateCompanyForm({ onCreate }: { onCreate?: () => void }) {
  const { address } = useAccount();
  const { writeContractAsync, isPending, error } = useWriteContract();

  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const [status, setStatus] = useState<CompanyStatus>("TRADING");
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
      alert("Conecta primero tu wallet para crear una empresa.");
      return;
    }

    if (!ticker || !name || !sector || !metadataURI) {
      alert("Por favor, rellena todos los campos.");
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: TRUFFED_METHOD_ADDRESS,
        abi: TRUFFED_METHOD_ABI as any,
        functionName: "createCompany",
        args: [
          ticker.trim().toUpperCase(),
          name.trim(),
          sector.trim(),
          metadataURI.trim(),
          COMPANY_STATUS_TO_UINT[status],
        ],
      });

      setTxHash(hash);

      // Limpiar formulario
      setTicker("");
      setName("");
      setSector("");
      setMetadataURI("");
      setStatus("TRADING");
    } catch (err) {
      console.error("Error creating company:", err);
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
        Create a new company
      </h2>
      <p style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "1rem" }}>
        Propose a new company with your fundamental analysis attached as a link.
      </p>

      {!address && (
        <p style={{ color: "#f97373", marginBottom: "1rem" }}>
          🔌 Conecta tu wallet para poder crear empresas.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          Ticker (ej: V, AAPL, TSLA)
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            maxLength={10}
            placeholder="V"
            style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #555" }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          Company name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Visa Inc."
            style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #555" }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          Sector
          <input
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Payments, Tech, Energy..."
            style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #555" }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          Metadata URI (link a tu informe{" "}
          <a
            href="https://github.com/charles030992/truffhed-method"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#60a5fa" }}
          >
            Truffhed
          </a>
          )
          <input
            type="text"
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            placeholder="https://... o ipfs://... (informe .md con el análisis fundamental)"
            style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #555" }}
          />
        </label>
        <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "-0.4rem" }}>
          El estado inicial debe corresponder a la conclusión de Valoración de ese informe (infravalorada → Value Investing, en precio → Trading, sobrevalorada → Overvalued).
        </p>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          Initial status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CompanyStatus)}
            style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #555" }}
          >
            <option value="VALUE">Value Investing</option>
            <option value="TRADING">Trading</option>
            <option value="OVERVALUED">Overvalued</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isPending || isConfirming || !address}
          style={{
            marginTop: "0.5rem",
            padding: "0.6rem 1rem",
            borderRadius: "9999px",
            border: "none",
            cursor: isPending || isConfirming || !address ? "not-allowed" : "pointer",
            backgroundColor: isPending || isConfirming || !address ? "#555" : "#4ade80",
            color: "#000",
            fontWeight: 600,
          }}
        >
          {isPending ? "Sending transaction..." : isConfirming ? "Confirming..." : "Create company"}
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

