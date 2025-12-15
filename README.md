# 🗳️ SmartVote – Decentralized Voting System

![Ethereum](https://img.shields.io/badge/Ethereum-Blockchain-blue)
![Solidity](https://img.shields.io/badge/Solidity-Smart%20Contracts-black)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB)
![Truffle](https://img.shields.io/badge/Framework-Truffle-orange)
![Ganache](https://img.shields.io/badge/Local%20Blockchain-Ganache-brown)

SmartVote is a **decentralized voting application (dApp)** built on the **Ethereum blockchain** as a **7th-semester Computer Science project**.  
It ensures **secure, transparent, and tamper-proof elections** managed through authenticated admins and verified voters.

---

## ✨ Features

- 🔐 Secure blockchain-based voting (Ethereum)
- 🧑💼 Admin-controlled voter verification
- 🗳️ One voter – one vote enforcement
- 📊 Real-time vote counting & results
- 🌗 Dark & Light mode UI
- 📁 CSV upload for voter approval 🏳️ Party logo upload
- 🗂️ Multiple elections & party management
- 🔑 OTP-based authentication (Sign In / Sign Out)
- ⏱️ Election start & end scheduling

---

## 👩💻 My Contributions

- 🎨 Complete **frontend redesign** with a modern, responsive UI
- 🌗 Implemented **Dark & Light mode**
- 🛠️ Designed and developed a **new Admin Dashboard**
- 📊 Added **Total Voters section** for real-time statistics
- 📁 Implemented **CSV file upload** for voter approval
- 🏳️ Added **party logo upload** functionality
- 🆔 Added **Admin ID & User ID management**
- 🗳️ Enabled **multiple elections** and **multiple party creation**
- 🔐 Implemented **OTP-based authentication & verification**
- ⏱️ Added **election start/end timing controls**

These enhancements significantly improved the platform's **usability, security and scalability**.

---

## 💻 Tech Stack

- **Smart Contracts:** Solidity
- **Framework:** Truffle
- **Local Blockchain:** Ganache
- **Frontend:** React.js
- **Blockchain Connector:** Web3.js, MetaMask
- **Package Manager:** Node.js (npm)

---

## 📁 Project Structure

```
blockchain-voting-app/
├── SmartVote/
│   ├── client/
│   │   ├── public/
│   │   └── src/
│   │       ├── component/
│   │       ├── contracts/
│   │       ├── getWeb3.js
│   │       └── App.js
│   ├── contracts/
│   │   ├── Election.sol
│   │   └── Migrations.sol
│   ├── migrations/
│   ├── test/
│   ├── truffle-config.js
│   └── README.md
```

## 🛠️ How to Run the Project

### ✅ Prerequisites

- Node.js
- Truffle

```bash
npm install -g truffle
```

- Ganache

```bash
npm install -g ganache-cli
```

- MetaMask Browser Extension

### 🚀 Installation (Requires 3 Terminals)

#### 🖥️ Terminal 1 – Start Blockchain

```bash
ganache-cli -d
```

#### 🖥️ Terminal 2 – Deploy Smart Contracts

```bash
git clone https://github.com/muskanmaurya2/blockchain-voting-app.git
cd blockchain-voting-app/SmartVote
cd SmartVote/client   
truffle migrate --reset
```

#### 🖥️ Terminal 3 – Start Frontend

```bash
cd SmartVote/client
npm install
npm start
```

App runs at 👉 http://localhost:3000

---

## 🖱️ Usage Guide

### 🔧 MetaMask Configuration
Import:

- **First private key** → Admin
- **Second private key** → Voter

### 🔄 Application Workflow

1. **Admin:** Add candidates & manage elections
2. **Voter:** Register as voter
3. **Admin:** Verify and approve voters
4. **Voter:** Cast vote
5. **Admin:** End election & view results

---

## 📸 Screenshots
![image alt](https://github.com/muskanmaurya2/Blockchain-Voting-App/tree/918394d2147c013c8255dc1731480697fb16cfb4/SmartVote/screenshots)

---
## 👥 Contributors

- Muskan Maurya 
- Aditya K.P
- Kavya R
- Ashwini Patil

---

## 🎓 Project Type

Academic Project – B.Tech Computer Science (7th Semester)
