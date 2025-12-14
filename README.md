# SmartVote - Decentralised Voting System

This project is a decentralized voting application (dApp) built on the Ethereum blockchain for a 7th-semester Computer Science project. It provides a secure, transparent, and tamper-proof voting system managed by a central admin who verifies voters and manages the election.

## 💻 Tech Stack
* **Smart Contracts:** Solidity
* **Development Framework:** Truffle
* **Local Blockchain:** Ganache
* **Frontend:** React.js
* **Blockchain Connector:** Web3.js / MetaMask
* **Package Manager:** Node.js (npm)

## 📁 Project Structure
```bash
blockchain-voting-app/
├── SmartVote/          # Main application directory
│   ├── client/           # React.js frontend application
│   │   ├── public/       # Static assets (index.html, etc.)
│   │   └── src/          # React app source code
│   │       ├── component/    # All React components (Admin, Voting, etc.)
│   │       ├── contracts/    # Compiled contract JSON artifacts (ABIs)
│   │       ├── getWeb3.js    # Utility script to connect to Web3
│   │       └── App.js        # Main React app component
│   │
│   ├── contracts/          # Solidity smart contracts
│   │   ├── Election.sol      # The core voting logic
│   │   └── Migrations.sol    # Truffle migration helper
│   │
│   ├── migrations/         # Truffle deployment scripts
│   │   └── 2_deploy_contracts.js
│   │
│   ├── test/               # (For Truffle tests)
│   │
│   ├── package.json
│   ├── README.md           # This file
│   └── truffle-config.js   # Truffle configuration
```
🛠️ How to Run
Prerequisites
Node.js
Truffle: npm install -g truffle
Ganache: npm install -g ganache-cli (or download the Ganache GUI)
MetaMask (Browser Extension)

Installation (Requires 3 Terminals)
1. Terminal 1: Run Blockchain configuration
```cd dVoting
cd client
# Start local blockchain with deterministic accounts
ganache-cli -d
```

Terminal 2: Deploy Contracts
```
# Clone repo and enter it
git clone [https://github.com/muskanmaurya2/blockchain-voting-app.git](https://github.com/muskanmaurya2/blockchain-voting-app.git)
cd blockchain-voting-app
# Enter the SmartVote directory
cd SmartVote
# Compile and deploy
truffle migrate --reset
```

3. Terminal 3: Launch Frontend
```
# From the root directory 'blockchain-voting-app'
cd SmartVote/client
# Install dependencies (first time only)
npm install
# Start React app
npm start
```

The app will open at http://localhost:3000.

🖱️ Usage
Configure MetaMask
Add a new custom network:
Name: Ganache Local
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Import the first private key from your ganache-cli terminal. This account is the Admin.
Import a second private key to use as a Voter.

App Workflow
As Admin: Go to the Admin page to add candidates.
As Voter: Switch to your voter account, go to the Registration page, and register.
As Admin: Switch back to the admin account, go to the verification panel, and approve the voter.
As Voter: Switch back to the voter account, go to the Voting page, and cast your vote.
As Admin: End the election. Results will be displayed.

👩‍💻 Creator Contributors:
Aditya K.P, Kavya R, Ashwini Patil, Muskan Maurya



My Contributions: Full frontend redesign, dark/light mode implementation, and the new admin page and added total voter section.
