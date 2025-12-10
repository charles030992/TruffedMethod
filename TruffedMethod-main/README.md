# Truffed Method

Proyecto: Truffed Method — DAO on-chain para clasificar empresas en: Value Investing, Trading u Overvalued.

Este repositorio contiene:

- `contracts/` — Contrato Solidity `TruffedMethod.sol` (Hardhat)
- `scripts/` — Scripts de despliegue
- `test/` — Tests de Hardhat
- `truffed-frontend/` — Frontend en React + Vite (Wagmi / Viem)

Objetivo
-------
Crear una DApp educativa que permita a la comunidad proponer, votar y ejecutar cambios de estado sobre empresas listadas on-chain. Ideal como proyecto final de bootcamp y demo en Alchemy.

Arquitectura
------------
- Smart contract: Solidity (Hardhat)
- Frontend: React + Vite + Wagmi + Viem
- Chain: Sepolia (puedes cambiar a mainnet sólo después de auditoría)

Quickstart (local)
------------------
Requisitos: Node.js 18+, npm, Git

1. Clona el repo

```bash
git clone https://github.com/charles030992/TruffedMethod.git
cd TruffedMethod
```

2. Configura variables de entorno (NO subir `.env` al repo)

Copiar el ejemplo y editarlo con tus claves (Alchemy, deployer private key si usas scripts):

```powershell
copy .env.example .env
notepad .env
# Rellenar VITE_SEPOLIA_RPC_URL y (opcional) DEPLOYER_PRIVATE_KEY
```

3. Instalar dependencias + compilar

Backend (Hardhat):

```bash
cd .
npm install
# Si trabajas con el backend (contratos)
npx hardhat compile
npx hardhat test
```

Frontend (truffed-frontend):

```bash
cd truffed-frontend
npm install
npm run dev
# Para build de producción
npm run build
```

Variables de entorno necesarias
- `VITE_SEPOLIA_RPC_URL` — URL de Alchemy/Infura para Sepolia (expuesta al cliente, usa clave sin privilegios de backend).
- `DEPLOYER_PRIVATE_KEY` — (solo para scripts de deploy en CI) clave privada del deployer; NO subir al repo.

Contrato desplegado (Sepolia)
----------------------------
Dirección desplegada (ejemplo): `0x0f90F732Ab499E9935ef30538A5B4cf570e0ba5B` — verifica en tu entorno y actualiza esta dirección si corresponde.

Seguridad y buenas prácticas
----------------------------
- Nunca subas claves privadas o archivos `.env` al repo. Usa `.env.example` y añade tus secrets en el servicio de CI / hosting.
- Siempre rota claves si sospechas que han sido expuestas.
- Recomendado: configurar GitHub Secrets (`ALCHEMY_SEPOLIA_URL`, `DEPLOYER_PRIVATE_KEY`, `VITE_SEPOLIA_RPC_URL`) y Vercel/Netlify env vars para despliegue.

Despliegue del frontend (Vercel)
--------------------------------
1. Conecta el repo en Vercel.
2. En Settings > Environment Variables añade `VITE_SEPOLIA_RPC_URL` con tu URL de Alchemy.
3. Build command: `npm run build` y carpeta de salida por defecto.

Verificación en Etherscan
-------------------------
Usa plugin Hardhat Etherscan para verificar fuentes (requiere API key):

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

CI (GitHub Actions)
--------------------
Se incluye un workflow de ejemplo en `.github/workflows/ci.yml` que ejecuta tests y build del frontend. Añade los secrets necesarios en GitHub Settings antes de ejecutar.

Checklist para presentación (video)
----------------------------------
- Mostrar arquitectura y roles.
- Demo: conectar wallet, crear empresa, ver la empresa en el listado.
- Crear propuesta, votar y (si aplica) ejecutar la propuesta y mostrar el cambio on-chain.
- Mostrar Etherscan txs y dirección del contrato.

Soporte / Contacto
------------------
Si quieres, puedo generar el README en inglés además del español, y un guion de vídeo paso a paso.

---

English
=======

Project: Truffed Method — On-chain DAO to classify companies into Value Investing, Trading or Overvalued.

This repository contains:

- `contracts/` — Solidity contract `TruffedMethod.sol` (Hardhat)
- `scripts/` — deployment scripts
- `test/` — Hardhat tests
- `truffed-frontend/` — React + Vite frontend (Wagmi / Viem)

Goal
----
Build an educational DApp that allows the community to propose, vote and execute status changes for companies on-chain. Suitable as a final project demo for Alchemy.

Architecture
------------
- Smart contract: Solidity (Hardhat)
- Frontend: React + Vite + Wagmi + Viem
- Network: Sepolia (switch to mainnet only after audit)

Quickstart (local)
------------------
Requirements: Node.js 18+, npm, Git

1. Clone the repo

```bash
git clone https://github.com/charles030992/TruffedMethod.git
cd TruffedMethod
```

2. Environment variables (DO NOT commit `.env`)

Copy the example and fill your keys (Alchemy, deployer key if needed):

```powershell
copy .env.example .env
notepad .env
# Fill VITE_SEPOLIA_RPC_URL and (optional) DEPLOYER_PRIVATE_KEY
```

3. Install & build

Backend (Hardhat):

```bash
npm install
npx hardhat compile
npx hardhat test
```

Frontend (truffed-frontend):

```bash
cd truffed-frontend
npm install
npm run dev
# For production build
npm run build
```

Environment variables
- `VITE_SEPOLIA_RPC_URL` — Alchemy/Infura URL for Sepolia (exposed to client). Use a non-sensitive key for browser use.
- `DEPLOYER_PRIVATE_KEY` — (CI/deploy only) private key for deploy scripts; keep it secret.

Deployed contract (Sepolia)
--------------------------
Example deployed address: `0x0f90F732Ab499E9935ef30538A5B4cf570e0ba5B`. Verify and update with your actual deployed address.

Security Best Practices
----------------------
- Never commit private keys or `.env` files. Use `.env.example` and store secrets in CI/hosting provider.
- Rotate keys if you suspect exposure.
- Use GitHub Secrets (`ALCHEMY_SEPOLIA_URL`, `DEPLOYER_PRIVATE_KEY`, `VITE_SEPOLIA_RPC_URL`) and Vercel/Netlify env vars for deployment.

Frontend Deployment (Vercel)
---------------------------
1. Connect the repo to Vercel.
2. Add `VITE_SEPOLIA_RPC_URL` in Project Settings > Environment Variables.
3. Build command: `npm run build`.

Etherscan Verification
----------------------
Use Hardhat Etherscan plugin to verify sources (requires API key):

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

CI (GitHub Actions)
--------------------
A sample workflow is included in `.github/workflows/ci.yml` that runs contract tests and builds the frontend. Add the required secrets in the GitHub repository settings.

Presentation checklist (video)
-----------------------------
- Show architecture and roles.
- Demo: connect wallet, create a company, see it listed.
- Create a proposal, vote, and (if available) execute the proposal and show the state change on-chain.
- Show Etherscan transactions and the contract address.

Support
-------
If you want, I can also provide an English video script and a readiness checklist for the demo recording.

# Truffed Method

A community-driven governance backend for **value investing & stock classification**.

This project is my final project for the **Alchemy University Ethereum Bootcamp**.  
The goal is to build a Web3 dApp where a community can:

- Propose stock tickers (e.g. `V`, `AAPL`, `TSLA`) with a linked fundamental analysis (stored off-chain, e.g. IPFS).
- Vote on the classification of each company as:
  - **Value Investing** – intrinsically undervalued vs. current market price.
  - **Trading** – fairly valued, suitable for shorter-term strategies if technical signals align.
  - **Overvalued** – intrinsic value much lower than current market price.
- Record the final classification **on-chain** via a simple governance mechanism.

This repo currently contains the **smart contract + tests (backend)**.  
A frontend (Next.js / Scaffold) will be built on top of this.

---

## ✨ Tech Stack

- **Solidity** `^0.8.28`
- **Hardhat** `^2.27.1`
- **Ethers** `^6.x` + `@nomicfoundation/hardhat-ethers`
- **Mocha / Chai** + `@nomicfoundation/hardhat-chai-matchers`

---

## 🧠 Core Contract: `TruffedMethod.sol`

The main features:

- `createCompany(ticker, name, sector, metadataURI, initialStatus)`
  - Creates a new company with:
    - `ticker` (e.g. `"V"`, `"AAPL"`)
    - `name`, `sector`
    - `metadataURI` – e.g. IPFS CID with the full fundamental analysis JSON
    - `initialStatus` – `ValueInvesting`, `Trading` or `Overvalued`
  - Stores the creator address as `createdBy`.
  - Emits `CompanyCreated(companyId, ticker, createdBy)`.

- `createProposal(companyId, proposedStatus, descriptionURI, duration)`
  - Creates a governance proposal to change the classification of a given company.
  - Uses `duration` (in seconds) to define the voting window.
  - Emits `ProposalCreated(proposalId, companyId, proposedStatus)`.

- `vote(proposalId, support)`
  - 1 address = 1 vote.
  - A voter can vote **yes** (`support = true`) or **no** (`support = false`).
  - Reverts if voting has not started or has already ended.
  - Emits `VoteCast(proposalId, voter, support)`.

- `executeProposal(proposalId)`
  - Can only be executed **after** the voting period.
  - Requirements:
    - At least **3 votes** in total (`MIN_VOTES = 3`).
    - At least **60%** of votes must be “yes”.
  - If conditions are met, the company’s `status` is updated to `proposedStatus`.
  - Emits `ProposalExecuted(proposalId, companyId, newStatus)`.

---

## 🧪 Running the Project

### 1. Install Dependencies

```bash
npm install
