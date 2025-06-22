
    //CivicPropsal.sol
    // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CivicProposal {
    struct Proposal {
        string text;
        string summary;
        string category;
        address submitter;
        uint256 timestamp;
        uint256 likes;
        uint256 dislikes;
    }

    Proposal[] public proposals;
    mapping(address => uint256[]) public userProposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted; // Tracks if user has voted on a proposal
    mapping(uint256 => mapping(address => bool)) public userLikes; // Tracks user's vote (true for like, false for dislike)

    event ProposalSubmitted(
        uint256 indexed proposalId,
        string text,
        string summary,
        string category,
        address submitter,
        uint256 timestamp
    );

    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool isLike,
        uint256 timestamp
    );

    function submitProposal(
        string memory _text,
        string memory _summary,
        string memory _category
    ) external {
        uint256 proposalId = proposals.length;
        proposals.push(
            Proposal({
                text: _text,
                summary: _summary,
                category: _category,
                submitter: msg.sender,
                timestamp: block.timestamp,
                likes: 0,
                dislikes: 0
            })
        );
        userProposals[msg.sender].push(proposalId);

        emit ProposalSubmitted(
            proposalId,
            _text,
            _summary,
            _category,
            msg.sender,
            block.timestamp
        );
    }

    function voteProposal(uint256 _proposalId, bool _isLike) external {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        require(!hasVoted[_proposalId][msg.sender], "User has already voted");

        if (_isLike) {
            proposals[_proposalId].likes += 1;
        } else {
            proposals[_proposalId].dislikes += 1;
        }

        hasVoted[_proposalId][msg.sender] = true;
        userLikes[_proposalId][msg.sender] = _isLike;

        emit Voted(
            _proposalId,
            msg.sender,
            _isLike,
            block.timestamp
        );
    }

    function getProposal(uint256 _proposalId) external view returns (
        string memory text,
        string memory summary,
        string memory category,
        address submitter,
        uint256 timestamp,
        uint256 likes,
        uint256 dislikes
    ) {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.text,
            proposal.summary,
            proposal.category,
            proposal.submitter,
            proposal.timestamp,
            proposal.likes,
            proposal.dislikes
        );
    }

    function getUserProposals(address _user) external view returns (uint256[] memory) {
        return userProposals[_user];
    }

    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }

    function hasUserVoted(uint256 _proposalId, address _user) external view returns (bool) {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        return hasVoted[_proposalId][_user];
    }

    function getUserVote(uint256 _proposalId, address _user) external view returns (bool) {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        require(hasVoted[_proposalId][_user], "User has not voted");
        return userLikes[_proposalId][_user];
    }
}

// contract address of civic:-0xD2Ab659a7BEd110b1e35d80D83380Cad64C505ec
//contract address of civic base sepolia:-0x94aA64E4f6DbE62c8910BeC0e088CE89FdA89B55