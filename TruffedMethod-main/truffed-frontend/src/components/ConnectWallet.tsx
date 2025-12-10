import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectWallet() {
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  const injectedConnector = connectors.find((c) => c.id === "injected");

  if (!isConnected) {
    return (
      <div>
        <button
          onClick={() => injectedConnector && connect({ connector: injectedConnector })}
          disabled={!injectedConnector || status === "pending"}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            background: "#4f46e5",
            color: "white",
          }}
        >
          {status === "pending" ? "Connecting..." : "Connect Wallet"}
        </button>
        {error && <p style={{ color: "red" }}>{error.message}</p>}
      </div>
    );
  }

  return (
    <div>
      <p>Connected: {address}</p>
      <button
        onClick={() => disconnect()}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          background: "crimson",
          color: "white",
        }}
      >
        Disconnect
      </button>
    </div>
  );
}
