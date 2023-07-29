let web3;
let contractInstance;
let connectedAddress;
let voted = false;

async function connect() {
    if (window.ethereum) {
        try {
            await window.ethereum.enable();
            web3 = new Web3(window.ethereum);
            const networkId = await web3.eth.net.getId();
            const contractAddress = '0x7f763F796d3c2fDA1027dFe7c29b18F80e596874'; // Replace with your deployed contract address
            const contractABI = [
              {
                "inputs": [
                  {
                    "internalType": "string[]",
                    "name": "_candidateNames",
                    "type": "string[]"
                  }
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
              },
              {
                "inputs": [
                  {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                  }
                ],
                "name": "candidates",
                "outputs": [
                  {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                  },
                  {
                    "internalType": "uint256",
                    "name": "points",
                    "type": "uint256"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [
                  {
                    "internalType": "uint256",
                    "name": "_candidate1",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "_candidate2",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "_candidate3",
                    "type": "uint256"
                  }
                ],
                "name": "castVote",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
              },
              {
                "inputs": [],
                "name": "currentStanding",
                "outputs": [
                  {
                    "components": [
                      {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                      },
                      {
                        "internalType": "uint256",
                        "name": "points",
                        "type": "uint256"
                      }
                    ],
                    "internalType": "struct Election.Candidate[]",
                    "name": "_candidates",
                    "type": "tuple[]"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [],
                "name": "getAllVotesOfCandiates",
                "outputs": [
                  {
                    "components": [
                      {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                      },
                      {
                        "internalType": "uint256",
                        "name": "points",
                        "type": "uint256"
                      }
                    ],
                    "internalType": "struct Election.Candidate[]",
                    "name": "",
                    "type": "tuple[]"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [],
                "name": "getRemainingTime",
                "outputs": [
                  {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [],
                "name": "getVotingStatus",
                "outputs": [
                  {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [],
                "name": "leader",
                "outputs": [
                  {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [
                  {
                    "internalType": "address",
                    "name": "voter",
                    "type": "address"
                  }
                ],
                "name": "registerVoter",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
              },
              {
                "inputs": [
                  {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                  }
                ],
                "name": "voters",
                "outputs": [
                  {
                    "internalType": "bool",
                    "name": "registered",
                    "type": "bool"
                  },
                  {
                    "internalType": "bool",
                    "name": "voted",
                    "type": "bool"
                  },
                  {
                    "internalType": "uint256",
                    "name": "vote",
                    "type": "uint256"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [],
                "name": "votingEnd",
                "outputs": [
                  {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [],
                "name": "votingStart",
                "outputs": [
                  {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [],
                "name": "winningCandidate",
                "outputs": [
                  {
                    "internalType": "uint256",
                    "name": "winningCandidate_",
                    "type": "uint256"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [],
                "name": "winningCandidateName",
                "outputs": [
                  {
                    "internalType": "string",
                    "name": "winnerName_",
                    "type": "string"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              }
            ]; // Replace with your contract's ABI
            contractInstance = new web3.eth.Contract(contractABI, contractAddress);
            connectedAddress = await web3.eth.getAccounts();
            console.log('Connected to MetaMask:', connectedAddress);
            showElectionPage();
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
        }
    } else {
        console.error('Please install MetaMask.');
    }
}

document.getElementById('connectBtn').addEventListener('click', connect);

async function getCandidateScores() {
    try {
        const candidateScores = await contractInstance.methods.currentStanding().call();
        console.log('Candidate Scores:', candidateScores);
        updateCandidateScores(candidateScores);
    } catch (error) {
        console.error('Error fetching candidate scores:', error);
    }
}
async function updateCandidateScores(candidateScores) {
    try {
  const table = document.getElementById('candidatesTable');
    table.innerHTML = '';
    for (let i = 0; i < candidateScores.length; i++) {
        const row = table.insertRow(i);
        const indexCell = row.insertCell(0);
        const nameCell = row.insertCell(1);
        const scoreCell = row.insertCell(2);

        indexCell.innerHTML = i;
        nameCell.innerHTML = candidateScores[i].name;
        scoreCell.innerHTML = candidateScores[i].points;
    }
  }
  catch (error){
    console.error('couldnt update scores', error);
  }
}

document.getElementById('voteForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const candidate1 = parseInt(document.getElementById('candidate1').value);
    const candidate2 = parseInt(document.getElementById('candidate2').value);
    const candidate3 = parseInt(document.getElementById('candidate3').value);

    try {
        const accounts = await web3.eth.getAccounts();
        await contractInstance.methods.castVote(candidate1, candidate2, candidate3).send({ from: accounts[0] });
        console.log('Vote submitted successfully!');
        voted = true;
        showSuccessMessage();
    } catch (error) {
        console.error('Error submitting vote:', error);
    }
});

async function updateScores() {
    try {
        const accounts = await web3.eth.getAccounts();
        await contractInstance.methods.updateScores().send({ from: accounts[0] });
        console.log('Scores updated successfully!');
        getCandidateScores();
    } catch (error) {
        console.error('Error updating scores:', error);
    }
}

document.getElementById('updateScoresBtn').addEventListener('click', updateScores);

function showElectionPage() {
    document.getElementById('connectBtn').style.display = 'none';
    document.getElementById('electionPage').style.display = 'block';
    getCandidateScores();
}

function showSuccessMessage() {
    document.getElementById('voteForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
}

// Call the function when the page loads
window.onload = async function () {
    if (web3) {
        // Check if the user has already voted
        const accounts = await web3.eth.getAccounts();
        const voter = await contractInstance.methods.voters(accounts[0]).call();
        if (voter.voted) {
            voted = true;
            showSuccessMessage();
        }
    }
};
