import { WagmiProvider, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { http } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";

const queryClient = new QueryClient();

// Leemos la URL del .env
// Prefer `VITE_SEPOLIA_RPC_URL`, pero acepta un fallback `VITE_ALCHEMY_SEPOLIA_URL`
const rpcUrl =
  (import.meta.env.VITE_SEPOLIA_RPC_URL as string) ||
  (import.meta.env.VITE_ALCHEMY_SEPOLIA_URL as string) ||
  "";

if (!rpcUrl) {
  console.warn(
    "No RPC URL provided. Set VITE_SEPOLIA_RPC_URL in your .env (do not commit .env)."
  );
}

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(rpcUrl),
  },
    connectors: [injected()], // 👈 aquí registramos el conector de MetaMask / browser wallet
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
