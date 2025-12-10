const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("TruffedMethod", function () {
  let TruffedMethod;
  let truffed;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    TruffedMethod = await ethers.getContractFactory("TruffedMethod");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    truffed = await TruffedMethod.deploy();
    await truffed.waitForDeployment();
  });

  describe("Company creation", function () {
    it("should create a new company and emit event", async function () {
      const tx = await truffed.createCompany(
        "TSLA",
        "Tesla Inc.",
        "Automotive",
        "ipfs://cid",
        1 // ValueInvesting
      );

      await expect(tx).to.emit(truffed, "CompanyCreated");

      const companyId = await truffed.companyIdByTicker("TSLA");
      const company = await truffed.companies(companyId);

      expect(company.ticker).to.equal("TSLA");
      expect(company.status).to.equal(1);
    });

    it("should not allow duplicate tickers", async function () {
      await truffed.createCompany(
        "AAPL",
        "Apple",
        "Technology",
        "ipfs://cid",
        1
      );

      await expect(
        truffed.createCompany(
          "AAPL",
          "Apple 2",
          "Tech",
          "ipfs://cid2",
          2
        )
      ).to.be.revertedWith("Company already exists");
    });
  });

  describe("Proposal and voting", function () {
    beforeEach(async function () {
      await truffed.createCompany(
        "NFLX",
        "Netflix",
        "Media",
        "ipfs://cid",
        2 // Trading
      );
    });

    it("should create a proposal", async function () {
      const companyId = await truffed.companyIdByTicker("NFLX");

      const tx = await truffed.createProposal(
        companyId,
        3, // Overvalued
        "ipfs://desc",
        3600 // 1 hora
      );

      await expect(tx).to.emit(truffed, "ProposalCreated");

      const proposal = await truffed.getProposal(1);
      expect(proposal.companyId).to.equal(companyId);
      expect(proposal.proposedStatus).to.equal(3);
    });

    it("should allow voting and execute proposal when conditions met", async function () {
      const companyId = await truffed.companyIdByTicker("NFLX");

      // duration más cómoda (10 segundos)
      await truffed.createProposal(companyId, 3, "ipfs://desc", 10);

      // 3 votos: 2 a favor, 1 en contra
      await truffed.connect(addr1).vote(1, true);
      await truffed.connect(addr2).vote(1, true);
      await truffed.connect(addr3).vote(1, false);

      // Avanzamos el tiempo para que termine la votación
      await network.provider.send("evm_increaseTime", [15]);
      await network.provider.send("evm_mine");

      await expect(truffed.executeProposal(1)).to.emit(
        truffed,
        "ProposalExecuted"
      );

      const company = await truffed.companies(companyId);
      expect(company.status).to.equal(3); // Overvalued
    });

    it("should revert execution if not enough support", async function () {
      const companyId = await truffed.companyIdByTicker("NFLX");

      await truffed.createProposal(companyId, 3, "ipfs://desc", 10);

      // 1 sí, 2 no -> 33% sí -> falla por falta de apoyo
      await truffed.connect(addr1).vote(1, true);
      await truffed.connect(addr2).vote(1, false);
      await truffed.connect(addr3).vote(1, false);

      await network.provider.send("evm_increaseTime", [15]);
      await network.provider.send("evm_mine");

      await expect(
        truffed.executeProposal(1)
      ).to.be.revertedWith("Not enough support");
    });

    it("should revert execution if not enough votes", async function () {
      const companyId = await truffed.companyIdByTicker("NFLX");

      await truffed.createProposal(companyId, 3, "ipfs://desc", 10);

      // Solo 1 voto -> no llega a MIN_VOTES (3)
      await truffed.connect(addr1).vote(1, true);

      await network.provider.send("evm_increaseTime", [15]);
      await network.provider.send("evm_mine");

      await expect(
        truffed.executeProposal(1)
      ).to.be.revertedWith("Not enough votes");
    });
  });
});
