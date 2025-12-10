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
