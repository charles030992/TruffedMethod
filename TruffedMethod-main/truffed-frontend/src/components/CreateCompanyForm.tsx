// src/components/CreateCompanyForm.tsx
import { useState, FormEvent } from "react";
import { useAccount, usePrepareContractWrite, useContractWrite } from "wagmi";
import { TRUFFED_METHOD_ADDRESS, TRUFFED_METHOD_ABI } from "../contracts/truffedMethod";

type CompanyStatus = "VALUE" | "TRADING" | "OVERVALUED";

const STATUS_TO_UINT: Record<CompanyStatus, number> = {
  VALUE: 0,
  TRADING: 1,
  OVERVALUED: 2,
};

export function CreateCompanyForm({ onCreate }: { onCreate?: () => void }) {
  const { address } = useAccount();
  const [isPendingLocal, setIsPendingLocal] = useState(false);
  const [errorLocal, setErrorLocal] = useState<Error | null>(null);
  const [dataLocal, setDataLocal] = useState<any>(null);

  const prepare = usePrepareContractWrite({
    address: TRUFFED_METHOD_ADDRESS,
    abi: TRUFFED_METHOD_ABI as any,
    functionName: "createCompany",
    // args will be provided at call time
    enabled: false,
  });

  const { writeAsync } = useContractWrite(prepare.config ?? {});

  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const [status, setStatus] = useState<CompanyStatus>("TRADING");
  const [txHash, setTxHash] = useState<string | null>(null);

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
      setTxHash(null);
      setIsPendingLocal(true);
      setErrorLocal(null);

      const args = [
        ticker.trim().toUpperCase(),
        name.trim(),
        sector.trim(),
        metadataURI.trim(),
        STATUS_TO_UINT[status],
      ];

      const tx = await writeAsync?.({ args });

      // show pending
      setTxHash(tx?.hash ?? "pending");
      setDataLocal(tx ?? null);

      // wait for confirmation (optional)
      if (tx?.wait) {
        await tx.wait();
      }

      // callback to parent to trigger refresh
      onCreate?.();

      // Limpiar formulario
      setTicker("");
      setName("");
      setSector("");
      setMetadataURI("");
      setStatus("TRADING");
    } catch (err: any) {
      console.error("Error creating company:", err);
      setErrorLocal(err as Error);
      setTxHash(null);
    } finally {
      setIsPendingLocal(false);
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
          Metadata URI (link a tu análisis)
          <input
            type="text"
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            placeholder="https://... o ipfs://..."
            style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #555" }}
          />
        </label>

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
          disabled={isPendingLocal || !address || !writeAsync}
          style={{
            marginTop: "0.5rem",
            padding: "0.6rem 1rem",
            borderRadius: "9999px",
            border: "none",
            cursor: isPendingLocal || !address ? "not-allowed" : "pointer",
            backgroundColor: isPendingLocal || !address ? "#555" : "#4ade80",
            color: "#000",
            fontWeight: 600,
          }}
        >
          {isPendingLocal ? "Sending transaction..." : "Create company"}
        </button>
      </form>
      {errorLocal && (
        <p style={{ marginTop: "0.75rem", color: "#f97373", fontSize: "0.85rem" }}>
          ⚠ Error: {errorLocal.message}
        </p>
      )}

      {dataLocal && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
          ✅ Transaction sent. Check on Etherscan:{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${dataLocal.hash ?? dataLocal}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#60a5fa" }}
          >
            {(dataLocal.hash ?? String(dataLocal)).slice(0, 10)}...
          </a>
        </p>
      )}
    </div>
  );
}

