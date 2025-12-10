// src/App.tsx
import "./App.css";
import { useAccount, useReadContract } from "wagmi";
import { ConnectWallet } from "./components/ConnectWallet";
import { CreateCompanyForm } from "./components/CreateCompanyForm";
import { CompanyList } from "./components/CompanyList";
import { TRUFFED_METHOD_ADDRESS, TRUFFED_METHOD_ABI } from "./contracts/truffedMethod";

function App() {
  const { address } = useAccount();
  const [refreshSignal, setRefreshSignal] = useState(0);

  const { data: nextCompanyIdRaw } = useReadContract({
    address: TRUFFED_METHOD_ADDRESS,
    abi: TRUFFED_METHOD_ABI,
    functionName: "nextCompanyId",
  });

  const nextCompanyId = nextCompanyIdRaw as bigint | undefined;

  const companiesRegistered =
    nextCompanyId && typeof nextCompanyId === "bigint"
      ? Number(nextCompanyId === 0n ? 0n : nextCompanyId - 1n)
      : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050816",
        color: "white",
        padding: "2rem 1.5rem",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <main style={{ width: "100%", maxWidth: "900px" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
              Truffed Method
            </h1>
            <p style={{ maxWidth: "520px", fontSize: "0.95rem", opacity: 0.85 }}>
              Community-driven classification of companies into{" "}
              <strong>Value Investing</strong>, <strong>Trading</strong> or{" "}
              <strong>Overvalued</strong>, backed by on-chain proposals & votes.
            </p>
          </div>
          <ConnectWallet />
        </header>

        <section
          style={{
            marginBottom: "1.5rem",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            border: "1px solid #333",
            background:
              "radial-gradient(circle at top left, rgba(30,64,175,0.4), transparent 60%)",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            On-chain status
          </h2>
          <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
            Connected:{" "}
            {address ? (
              <span style={{ fontFamily: "monospace" }}>
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            ) : (
              <span style={{ opacity: 0.8 }}>not connected</span>
            )}
          </p>
          <p style={{ fontSize: "0.9rem", marginTop: "0.35rem" }}>
            Companies registered:{" "}
            <strong>{companiesRegistered}</strong>
          </p>
        </section>

        {/* ✅ Aquí va nuestro formulario para crear empresas */}
        <CreateCompanyForm onCreate={() => setRefreshSignal((s) => s + 1)} />
        <CompanyList refreshSignal={refreshSignal ?? nextCompanyIdRaw} />

        {/* Más adelante añadiremos:
            - Lista de empresas
            - Formulario de propuestas
            - Votaciones
        */}
      </main>
    </div>
  );
}

export default App;




