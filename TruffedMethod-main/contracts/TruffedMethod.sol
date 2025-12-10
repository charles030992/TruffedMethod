// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Truffed Method Governance for Stock Classification
/// @notice Permite a la comunidad proponer y votar la clasificación de empresas
///         como Value Investing, Trading u Overvalued. Cada dirección tiene un voto.
///         Una propuesta necesita al menos 3 votos y un 60 % de apoyos para ejecutarse.
contract TruffedMethod {
    enum CompanyStatus { None, ValueInvesting, Trading, Overvalued }

    struct Company {
        uint256 id;
        string ticker;
        string name;
        string sector;
        CompanyStatus status;
        string metadataURI;
        address createdBy;
        bool exists;
    }

    struct Proposal {
        uint256 id;
        uint256 companyId;
        CompanyStatus proposedStatus;
        string descriptionURI;
        uint256 yesVotes;
        uint256 noVotes;
        uint64 startTime;
        uint64 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    uint256 public constant MIN_VOTES = 3;

    uint256 public nextCompanyId;
    uint256 public nextProposalId;

    mapping(uint256 => Company) public companies;
    mapping(string => uint256) public companyIdByTicker;
    mapping(uint256 => Proposal) private _proposals;

    event CompanyCreated(uint256 indexed companyId, string ticker, address indexed createdBy);
    event ProposalCreated(uint256 indexed proposalId, uint256 indexed companyId, CompanyStatus proposedStatus);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId, uint256 indexed companyId, CompanyStatus newStatus);

    function getProposal(uint256 proposalId)
        external
        view
        returns (
            uint256 id,
            uint256 companyId,
            CompanyStatus proposedStatus,
            string memory descriptionURI,
            uint256 yesVotes,
            uint256 noVotes,
            uint64 startTime,
            uint64 endTime,
            bool executed
        )
    {
        Proposal storage p = _proposals[proposalId];
        return (
            p.id,
            p.companyId,
            p.proposedStatus,
            p.descriptionURI,
            p.yesVotes,
            p.noVotes,
            p.startTime,
            p.endTime,
            p.executed
        );
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return _proposals[proposalId].hasVoted[voter];
    }

    function createCompany(
        string memory ticker,
        string memory name,
        string memory sector,
        string memory metadataURI,
        CompanyStatus initialStatus
    ) external {
        require(initialStatus != CompanyStatus.None, "Invalid initial status");
        require(bytes(ticker).length > 0, "Ticker required");
        require(companyIdByTicker[ticker] == 0, "Company already exists");

        nextCompanyId += 1;
        uint256 companyId = nextCompanyId;

        companies[companyId] = Company({
            id: companyId,
            ticker: ticker,
            name: name,
            sector: sector,
            status: initialStatus,
            metadataURI: metadataURI,
            createdBy: msg.sender,
            exists: true
        });

        companyIdByTicker[ticker] = companyId;
        emit CompanyCreated(companyId, ticker, msg.sender);
    }

    function createProposal(
        uint256 companyId,
        CompanyStatus proposedStatus,
        string memory descriptionURI,
        uint64 duration
    ) external {
        require(companies[companyId].exists, "Company does not exist");
        require(proposedStatus != CompanyStatus.None, "Invalid proposed status");
        require(duration > 0, "Duration must be positive");

        nextProposalId += 1;
        uint256 proposalId = nextProposalId;

        Proposal storage p = _proposals[proposalId];
        p.id = proposalId;
        p.companyId = companyId;
        p.proposedStatus = proposedStatus;
        p.descriptionURI = descriptionURI;
        p.startTime = uint64(block.timestamp);
        p.endTime = uint64(block.timestamp) + duration;

        emit ProposalCreated(proposalId, companyId, proposedStatus);
    }

    function vote(uint256 proposalId, bool support) external {
        Proposal storage p = _proposals[proposalId];
        require(p.id != 0, "Proposal does not exist");
        require(!p.executed, "Proposal already executed");
        require(block.timestamp >= p.startTime, "Voting has not started");
        require(block.timestamp <= p.endTime, "Voting has ended");
        require(!p.hasVoted[msg.sender], "Already voted");

        p.hasVoted[msg.sender] = true;
        if (support) {
            p.yesVotes += 1;
        } else {
            p.noVotes += 1;
        }
        emit VoteCast(proposalId, msg.sender, support);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage p = _proposals[proposalId];
        require(p.id != 0, "Proposal does not exist");
        require(!p.executed, "Proposal already executed");
        require(block.timestamp > p.endTime, "Voting still active");

        uint256 totalVotes = p.yesVotes + p.noVotes;
        require(totalVotes >= MIN_VOTES, "Not enough votes");
        uint256 yesPercentage = (p.yesVotes * 100) / totalVotes;
        require(yesPercentage >= 60, "Not enough support");

        Company storage c = companies[p.companyId];
        c.status = p.proposedStatus;
        p.executed = true;

        emit ProposalExecuted(proposalId, p.companyId, p.proposedStatus);
    }
}