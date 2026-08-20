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
- Smart contract: Solidity `^0.8.28` (Hardhat `^2.27`, Ethers `^6`)
- Frontend: React + Vite + Wagmi + Viem
- Chain: Sepolia (puedes cambiar a mainnet sólo después de auditoría)

Contrato principal: `TruffedMethod.sol`
----------------------------------------
- `createCompany(ticker, name, sector, metadataURI, initialStatus)` — registra una nueva empresa. `metadataURI` debe apuntar al análisis fundamental (p. ej. IPFS). Emite `CompanyCreated`.
- `createProposal(companyId, proposedStatus, descriptionURI, duration)` — abre una propuesta para cambiar la clasificación de una empresa, con ventana de votación de `duration` segundos. Emite `ProposalCreated`.
- `vote(proposalId, support)` — 1 dirección = 1 voto, sí/no. Falla si la votación no ha empezado o ya terminó. Emite `VoteCast`.
- `executeProposal(proposalId)` — solo tras cerrar la votación; requiere al menos 3 votos (`MIN_VOTES`) y ≥60% de apoyo. Si se cumple, actualiza el `status` de la empresa. Emite `ProposalExecuted`.

Análisis fundamental (Truffhed)
-------------------------------
`metadataURI` (al crear una empresa) y `descriptionURI` (al crear una propuesta) están pensados para enlazar un informe de análisis fundamental, no para rellenarse a mano sin criterio. La metodología recomendada es **Truffhed** ([github.com/charles030992/truffhed-method](https://github.com/charles030992/truffhed-method)): value investing conservador (Buffett/Munger/Graham), scoring sobre 5 bloques, con regla de corte si la calidad es insuficiente.

Flujo recomendado:
1. Genera los datos financieros con `scripts/fetch_truffhed_data.py` de ese repo.
2. Pide el análisis con la skill `truffhed-fundamental-review` (Fase 1 cualitativa + Fase 2 financiera) para obtener el informe en Markdown.
3. Sube el informe donde prefieras (IPFS, gist, raw de GitHub) y usa esa URL como `metadataURI`/`descriptionURI`.
4. El **estado inicial** de la empresa (o el estado propuesto) debe corresponder a la *conclusión de Valoración* del informe (infravalorada → Value Investing, en precio → Trading, sobrevalorada → Overvalued) — no a una intuición sin respaldo. Si el Score de Truffhed es ≤2, el método recomienda no valorar todavía; usa ese criterio antes de registrar la empresa.

Esta conexión es todavía manual (copiar/pegar la URL) — no hay subida automática a IPFS integrada en el frontend.

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
npm install
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
Dirección: `0x0f90F732Ab499E9935ef30538A5B4cf570e0ba5B` — verifica en tu entorno y actualiza esta dirección si corresponde.

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
Workflow en `.github/workflows/ci.yml` que ejecuta tests de contratos y build del frontend en cada push/PR a `main`. Añade los secrets necesarios en GitHub Settings antes de ejecutarlo.

Checklist para presentación (video)
----------------------------------
- Mostrar arquitectura y roles.
- Demo: conectar wallet, crear empresa, ver la empresa en el listado.
- Crear propuesta, votar y (si aplica) ejecutar la propuesta y mostrar el cambio on-chain.
- Mostrar Etherscan txs y dirección del contrato.

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
Build an educational DApp that allows the community to propose, vote and execute status changes for companies on-chain. Suitable as a final project demo for Alchemy University's Ethereum Bootcamp.

Architecture
------------
- Smart contract: Solidity `^0.8.28` (Hardhat `^2.27`, Ethers `^6`)
- Frontend: React + Vite + Wagmi + Viem
- Network: Sepolia (switch to mainnet only after audit)

Core contract: `TruffedMethod.sol`
------------------------------------
- `createCompany(ticker, name, sector, metadataURI, initialStatus)` — registers a new company. `metadataURI` should point to the linked fundamental analysis (e.g. IPFS). Emits `CompanyCreated`.
- `createProposal(companyId, proposedStatus, descriptionURI, duration)` — opens a governance proposal to change a company's classification, with a `duration`-second voting window. Emits `ProposalCreated`.
- `vote(proposalId, support)` — 1 address = 1 vote, yes/no. Reverts if voting hasn't started or already ended. Emits `VoteCast`.
- `executeProposal(proposalId)` — only after the voting window closes; requires at least 3 votes (`MIN_VOTES`) and ≥60% support. Updates the company's `status` on success. Emits `ProposalExecuted`.

Fundamental analysis (Truffhed)
--------------------------------
`metadataURI` (when creating a company) and `descriptionURI` (when creating a proposal) are meant to link a fundamental analysis report, not to be filled in without backing. The recommended methodology is **Truffhed** ([github.com/charles030992/truffhed-method](https://github.com/charles030992/truffhed-method)): conservative value investing (Buffett/Munger/Graham), a 5-block quality score, with a hard cutoff when quality is insufficient.

Recommended flow:
1. Generate the financial data with `scripts/fetch_truffhed_data.py` from that repo.
2. Ask for the analysis using the `truffhed-fundamental-review` skill (qualitative Phase 1 + financial Phase 2) to get the Markdown report.
3. Host the report wherever you prefer (IPFS, a gist, a raw GitHub URL) and use that URL as `metadataURI`/`descriptionURI`.
4. The company's **initial status** (or the proposed status) should match the report's *Valuation conclusion* (undervalued → Value Investing, fairly priced → Trading, overvalued → Overvalued) — not an unsupported guess. If the Truffhed Score is ≤2, the method recommends not valuing yet; apply that before registering the company.

This connection is still manual (copy/paste the URL) — there is no automatic IPFS upload built into the frontend.

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
Address: `0x0f90F732Ab499E9935ef30538A5B4cf570e0ba5B` — verify and update with your actual deployed address.

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
Workflow at `.github/workflows/ci.yml` runs contract tests and builds the frontend on every push/PR to `main`. Add the required secrets in the GitHub repository settings before running it.

Presentation checklist (video)
-----------------------------
- Show architecture and roles.
- Demo: connect wallet, create a company, see it listed.
- Create a proposal, vote, and (if available) execute the proposal and show the state change on-chain.
- Show Etherscan transactions and the contract address.

License
-------
MIT — see `LICENSE`.
