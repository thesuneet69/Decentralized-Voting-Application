const { expect } = require("chai");
const { ethers } = require("hardhat");

// Create a new `Election` contract and wait for it to be deployed.
async function newElection() {
  const Election = await ethers.getContractFactory("Election");
  const election = await Election.deploy(["alice", "bob", "carol", "dick", "emma", "fatass", "gary"]);
  await election.deployed();
  return election;
}

describe("Election", function () {
  it("sets the leader to the address that created the contract", async function () {
    const [owner] = await ethers.getSigners();
    const election = await newElection();

    // Check if leader is the address of the contract creator.
    expect(await election.leader()).to.equal(owner.address);
  });

  it("starts all candidates with 0 points", async function () {
    const [owner] = await ethers.getSigners();
    const election = await newElection();

    // Check that all candidates start with 0 points.
    for (let i = 0; i < 7; i++) {
      expect((await election.candidates(i)).points).to.equal(0);
    }
  });

  it("allows the leader to register new voters", async function () {
    const [owner, address1, address2] = await ethers.getSigners();
    const election = await newElection();

    const registerVoterTx = await election.registerVoter(address1.address);
    await registerVoterTx.wait(); // wait until the transaction is mined

    // Check that the voter has successfully registered.
    expect((await election.voters(address1.address)).registered).to.equal(true);
    expect((await election.voters(address1.address)).voted).to.equal(false);

    // A second voter...
    const registerVoterTx2 = await election.registerVoter(address2.address);
    await registerVoterTx2.wait();

    expect((await election.voters(address2.address)).registered).to.equal(true);
    expect((await election.voters(address2.address)).voted).to.equal(false);
  });
  

  it("allows a registered voter to vote with preferences", async function () {
    const [owner, address1, address2] = await ethers.getSigners();
    const election = await newElection();

    const registerVoterTx = await election.registerVoter(address1.address);
    await registerVoterTx.wait();

    const registerVoterTx1 = await election.registerVoter(address2.address);
    await registerVoterTx1.wait();

    // Vote for Alice as the 1st preference.
    const voteTx = await election.connect(address1).castVote(5, 2, 4);
    await voteTx.wait();

    const voteTx1 = await election.connect(address2).castVote(6, 5, 2);
    await voteTx1.wait();

    // Check that the candidates have the correct points.
    expect((await election.candidates(2)).points).to.equal(4); // Alice gets 8 points
    expect((await election.candidates(5)).points).to.equal(8); // Bob gets 6 points
    expect((await election.candidates(4)).points).to.equal(1); // Carol gets 4 point

    // Check that the voter's vote has been updated.
    const voterInfo = await election.voters(address1.address);
    //-expect(voterInfo.preferences[0]).to.equal(0); // 1st preference - Alice
    //-expect(voterInfo.preferences[1]).to.equal(2); // 2nd preference - Bob
    //-expect(voterInfo.preferences[2]).to.equal(1); // 3rd preference - Carol

    // Check that the voter's voted boolean is set to true.
    expect(voterInfo.voted).to.equal(true);
  });

  it("can determine the winner of an election based on points", async function () {
    const [owner, address1, address2, address3] = await ethers.getSigners();
    const election = await newElection();

    // Register our voters
    let registerVoterTx = await election.registerVoter(address1.address);
    await registerVoterTx.wait();
    registerVoterTx = await election.registerVoter(address2.address);
    await registerVoterTx.wait();
    registerVoterTx = await election.registerVoter(address3.address);
    await registerVoterTx.wait();

    // Vote with preferences
    let voteTx = await election.connect(address1).castVote(1, 0, 2); // Bob gets 5 points, Alice gets 3 points, Carol gets 1 point
    await voteTx.wait();
    voteTx = await election.connect(address2).castVote(1, 0, 2); // Bob gets 5 points, Alice gets 3 points, Carol gets 1 point
    await voteTx.wait();
    voteTx = await election.connect(address3).castVote(2, 0, 1); // Carol gets 5 points, Alice gets 3 points, Bob gets 1 point
    await voteTx.wait();

    // Check that winningCandidateName returns the winner Bob.
    expect(await election.winningCandidateName()).to.equal("bob");

    const election2 = await newElection();

    // Register our voters
    registerVoterTx = await election2.registerVoter(address1.address);
    await registerVoterTx.wait();
    registerVoterTx = await election2.registerVoter(address2.address);
    await registerVoterTx.wait();
    registerVoterTx = await election2.registerVoter(address3.address);
    await registerVoterTx.wait();

    // Vote with preferences
    voteTx = await election2.connect(address1).castVote(2, 1, 0); // Carol gets 5 points, Bob gets 3 points, Alice gets 1 point
    await voteTx.wait();
    voteTx = await election2.connect(address2).castVote(1, 2, 0); // Bob gets 5 points, Carol gets 3 points, Alice gets 1 point
    await voteTx.wait();
    voteTx = await election2.connect(address3).castVote(2, 0, 1); // Carol gets 5 points, Alice gets 3 points, Bob gets 1 point
    await voteTx.wait();

    // Check that winningCandidateName returns the winner Carol.
    expect(await election2.winningCandidateName()).to.equal("carol");
  });

  it("prevents election counting if no votes have been cast", async function () {
    const [owner] = await ethers.getSigners();
    const election = await newElection();

    await expect(election.winningCandidateName()).to.be.revertedWith("No votes have been cast.");
  });

  it("prevents unregistered voters from voting", async function () {
    const [owner, address1] = await ethers.getSigners();
    const election = await newElection();

    // Attempt to vote
    await expect(election.connect(address1).castVote(0, 1, 2)).to.be.revertedWith('Voter is not registered.');
  });

  it("prevents double voting", async function () {
    const [owner, address1] = await ethers.getSigners();
    const election = await newElection();

    // Register our voter
    const registerVoterTx = await election.registerVoter(address1.address);
    await registerVoterTx.wait();

    // Vote
    let voteTx = await election.connect(address1).castVote(0, 1, 2);
    await voteTx.wait();

    // Attempt to vote again
    await expect(election.connect(address1).castVote(0, 1, 2)).to.be.revertedWith('Already voted.');
  });

  it("protects voter registration from non-leaders", async function () {
    const [owner, address1, address2] = await ethers.getSigners();
    const election = await newElection();

    // Attempt to register
    await expect(election.connect(address1).registerVoter(address2.address))
        .to.be.revertedWith('Only the election leader can grant voting rights.');
  });

  it("protects against double registration", async function () {
    const [owner, address1] = await ethers.getSigners();
    const election = await newElection();

    // Register our voter
    const registerVoterTx = await election.registerVoter(address1.address);
    await registerVoterTx.wait();

    // Attempt to register again
    await expect(election.registerVoter(address1.address))
        .to.be.revertedWith('Voter is already registered.');
  });
});