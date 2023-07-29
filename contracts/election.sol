// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

contract Election {
    // This is a type for a single voter.
    struct Voter {
        bool registered; // if true, this voter is eligible to vote
        bool voted; // if true, this voter already voted
        uint256 vote; // points for 1st, 2nd, and 3rd preferences respectively
    }

    // This is a type for a single candidate.
    struct Candidate {
        string name; // short name (up to 32 bytes)
        uint256 points; // total points received
    }

    // This is the leader (creator) of the election.
    address public leader;

    // This declares a state variable that
    // maps a `Voter` to each possible address.
    mapping(address => Voter) public voters;

    // A dynamically-sized array of `Candidate` structs.
    Candidate[] public candidates;
    uint256 public votingEnd;
    uint256 public votingStart;
    

    /// Create a new election to choose one of `_candidateNames`.
    constructor(string[] memory _candidateNames) {
        leader = msg.sender;
        voters[leader].registered = true;

        // For each provided candidate name, create
        // a new `Candidate` and add it to the end
        // of the `candidates` array.
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            // `Candidate({...})` creates a temporary
            // Candidate object and `candidates.push(...)`
            // appends it to the end of `candidates`.
            candidates.push(Candidate({name: _candidateNames[i], points: 0}));
        }
        //votingStart = block.timestamp;
        //votingEnd = block.timestamp + (_duration * 1 minutes);
    }

    // Grants the right to vote on this ballot to `voter`.
    // Can only be called by `leader`.
    function registerVoter(address voter) external {
        require(
            msg.sender == leader,
            "Only the election leader can grant voting rights."
        );
        require(!voters[voter].voted, "The voter already voted.");
        require(!voters[voter].registered, "Voter is already registered.");
        voters[voter].registered = true;
        // TODO: Register a voter with the given address by setting
        // the `registered` field of the corresponding Voter to true.
    }

    /// Give your vote
    /// to candidate `_candidates[0]` as 1st preference,
    /// `_candidates[1]` as 2nd preference, and
    /// `_candidates[2]` as 3rd preference.
    
    function castVote(uint256 _candidate1, uint256 _candidate2, uint256 _candidate3) external {
    Voter storage voter = voters[msg.sender];
    require(voter.registered, "Voter is not registered.");
    require(!voter.voted, "Already voted.");

        // Assign points based on preferences (5, 3, 1)
        candidates[_candidate1].points += 5;
        candidates[_candidate2].points += 3;
        candidates[_candidate3].points += 1;
    

    voter.voted = true;
}


    function getAllVotesOfCandiates() public view returns (Candidate[] memory){
        return candidates;
    }

    function getVotingStatus() public view returns (bool) {
        return (block.timestamp >= votingStart && block.timestamp < votingEnd);
    }

    function getRemainingTime() public view returns (uint256) {
        require(block.timestamp >= votingStart, "Voting has not started yet.");
        if (block.timestamp >= votingEnd) {
            return 0;
    }
        return votingEnd - block.timestamp;
    }

    function currentStanding() public view returns (Candidate[] memory _candidates) {
        return candidates;
    } 



    // Determine the winning candidate.
    function winningCandidate() public view returns (uint256 winningCandidate_) {
        uint256 maxPoints = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].points > maxPoints) {
                maxPoints = candidates[i].points;
                winningCandidate_ = i;
            }
        }
        require(maxPoints > 0, "No votes have been cast.");
        // TODO: Iterate through the candidates array
        // and determine which candidate got the most points.
        // Return the index of the winner in `winningCandidate_`
        // Error and revert if no votes have been cast yet.
    }

    // Calls winningCandidate() function to get the index
    // of the winner and then returns the name of the winner.
    function winningCandidateName() external view returns (string memory winnerName_) {
        uint256 winningCandidateIndex = winningCandidate();
        winnerName_ = candidates[winningCandidateIndex].name;
        // TODO: Return the name of the
        // winner in `winnerName_` using the
        // candidates array and the winningCandidate() function.
    }
}