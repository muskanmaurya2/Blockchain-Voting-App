import React, { Component } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import NavbarAdmin from "../../Navbar/NavigationAdmin";
import Navbar from "../../Navbar/Navigation";
import AdminOnly from "../../AdminOnly";
import getWeb3 from "../../../getWeb3";
import Election from "../../../contracts/Election.json";
import "./Verification.css";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      voterCount: undefined,
      voters: [],
      fileList: null, // For storing uploaded file
      collectedVoterData: [], // For storing parsed voter data
      showConfirmation: false, // For showing confirmation button
    };
    
    // Bind methods to this
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.bulkRegisterVoters = this.bulkRegisterVoters.bind(this);
    this.processVoterData = this.processVoterData.bind(this);
    this.confirmVoterData = this.confirmVoterData.bind(this);
    this.resetVoterCollection = this.resetVoterCollection.bind(this);
    this.renderCollectedVoterData = this.renderCollectedVoterData.bind(this);
  }

  // refreshing once
  componentDidMount = async () => {
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Election.networks[networkId];
      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, ElectionInstance: instance, account: accounts[0] });

      // Admin account and verification
      const admin = await instance.methods.getAdmin().call();
      if (accounts[0] === admin) {
        this.setState({ isAdmin: true });
      }
      
      // Total number of voters
      const voterCount = await instance.methods
        .getTotalVoter()
        .call();
      this.setState({ voterCount: voterCount });

      // Loading all the voters
      let votersArray = [];
      for (let i = 0; i < voterCount; i++) {
        const voterAddress = await instance.methods
          .voters(i)
          .call();
        const voter = await instance.methods
          .voterDetails(voterAddress)
          .call();
        votersArray.push({
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        });
      }
      this.setState({ voters: votersArray });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  // Handle file upload
  handleFileUpload = (event) => {
    console.log('File upload event triggered:', event);
    console.log('Selected file:', event.target.files[0]);
    this.setState({ 
      fileList: event.target.files[0],
      collectedVoterData: [],
      showConfirmation: false
    }, () => {
      console.log('State updated. File list:', this.state.fileList);
    });
  }

  // Parse and register voters from uploaded file
  bulkRegisterVoters = async () => {
    console.log('Bulk register voters function called');
    console.log('Current file list:', this.state.fileList);
    
    if (!this.state.fileList) {
      alert("Please select a file first!");
      return;
    }

    const file = this.state.fileList;
    const fileName = file.name;

    try {
      console.log('Processing file:', fileName);
      if (fileName.endsWith(".csv")) {
        // Handle CSV files
        Papa.parse(file, {
          complete: async (result) => {
            await this.processVoterData(result.data);
          },
          header: true,
          skipEmptyLines: true,
        });
      } else if (
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".xls") ||
        fileName.endsWith(".json") ||
        fileName.endsWith(".txt")
      ) {
        // Handle Excel, JSON, and TXT files
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          
          // Get first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          await this.processVoterData(jsonData);
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("Unsupported file format! Please upload CSV, Excel, JSON, or TXT files.");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file. Please check the console for details.");
    }
  };

  // Process voter data and register voters
  processVoterData = async (voterData) => {
    try {
      let processedVoters = [];
      let errorCount = 0;

      for (const voter of voterData) {
        try {
          // Extract voter information (adjust field names as needed)
          const voterName = voter.name || voter.Name || voter.fullname || voter.FullName || "";
          const voterPhone = voter.phone || voter.Phone || voter.phoneNumber || voter.PhoneNumber || "";
          const voterAddress = voter.address || voter.Address || voter.wallet || voter.WalletAddress || "";

          // Validate required fields
          if (!voterName || !voterAddress) {
            console.warn("Skipping voter with missing required fields:", voter);
            errorCount++;
            continue;
          }

          processedVoters.push({
            name: voterName,
            phone: voterPhone,
            address: voterAddress
          });
        } catch (error) {
          console.error("Error processing voter:", voter, error);
          errorCount++;
        }
      }

      this.setState({
        collectedVoterData: processedVoters,
        showConfirmation: processedVoters.length > 0
      });

      if (processedVoters.length > 0) {
        alert(`Voter data collected successfully!
Processed: ${processedVoters.length}
Errors: ${errorCount}

Click "Confirm Voter Data" to proceed.`);
      } else {
        alert("No valid voter data found in the file.");
      }
    } catch (error) {
      console.error("Error in processVoterData:", error);
      alert("Error processing voter data. Please check the console for details.");
    }
  };

  // Confirm and display collected voter data
  confirmVoterData = () => {
    if (this.state.collectedVoterData.length > 0) {
      // Here you could save the data to a database, send emails, etc.
      // For now, we'll just display it and provide download option
      alert(`Voter data confirmed!
${this.state.collectedVoterData.length} voters ready for distribution.

Note: Due to contract limitations, voters must register themselves using the Registration page.

You can now distribute this information to voters.`);

      // Optionally, you could generate a downloadable file here
      this.generateVoterListFile();
    }
  };

  // Reset the voter collection process
  resetVoterCollection = () => {
    this.setState({
      fileList: null,
      collectedVoterData: [],
      showConfirmation: false
    });
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Generate a downloadable file with voter information
  generateVoterListFile = () => {
    try {
      // Create CSV content
      let csvContent = "Name,Phone,Wallet Address\n";
      this.state.collectedVoterData.forEach(voter => {
        csvContent += `"${voter.name}","${voter.phone || ''}","${voter.address}"\n`;
      });

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'voter_list.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating voter list file:", error);
      alert("Error generating voter list file. Please check the console for details.");
    }
  };

  verifyVoter = async (isVerified, address) => {
    await this.state.ElectionInstance.methods
      .verifyVoter(isVerified, address)
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };

  renderUnverifiedVoters = (voter) => {
    const verifyVoter = this.verifyVoter;

    return (
      <>
        {voter.isVerified ? (
          <div className="container-list success">
            <p style={{ margin: "10px 0px" }}>Voter Verified</p>
            <table>
              <tr>
                <th>Account Address</th>
                <td>{voter.address}</td>
              </tr>
              <tr>
                <th>Name</th>
                <td>{voter.name}</td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>{voter.phone}</td>
              </tr>
              <tr>
                <th>Voted</th>
                <td>{voter.hasVoted ? "True" : "False"}</td>
              </tr>
            </table>
          </div>
        ) : null}
        <div
          className="container-list attention"
          style={{ display: voter.isVerified ? "none" : null }}
        >
          <table>
            <tr>
              <th>Admin ID</th>
              <td>{voter.address}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{voter.name}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{voter.phone}</td>
            </tr>
            <tr>
              <th>Voted</th>
              <td>{voter.hasVoted ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Verified</th>
              <td>{voter.isVerified ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{voter.isRegistered ? "True" : "False"}</td>
            </tr>
          </table>
          <div style={{}}>
            <button
              className="btn-verification approve"
              disabled={voter.isVerified}
              onClick={() => verifyVoter(true, voter.address)}
            >
              Approve
            </button>
          </div>
        </div>
      </>
    );
  };
  
  renderCollectedVoterData = () => {
    if (!this.state.showConfirmation || this.state.collectedVoterData.length === 0) {
      return null;
    }
    
    return (
      <div className="container-item info">
        <center>
          <h4>Collected Voter Data</h4>
          <p>{this.state.collectedVoterData.length} voters collected</p>
          
          <div style={{ maxHeight: "300px", overflowY: "auto", margin: "20px 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>Name</th>
                  <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>Phone</th>
                  <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>Address</th>
                </tr>
              </thead>
              <tbody>
                {this.state.collectedVoterData.map((voter, index) => (
                  <tr key={index}>
                    <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{voter.name}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{voter.phone}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{voter.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ margin: "20px 0" }}>
            <button 
              className="btn-verification approve" 
              onClick={this.confirmVoterData}
              style={{ margin: "10px" }}
            >
              Confirm Voter Data
            </button>
            <button 
              className="btn-verification reject" 
              onClick={this.resetVoterCollection}
              style={{ margin: "10px" }}
            >
              Reset
            </button>
          </div>
        </center>
      </div>
    );
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }
    if (!this.state.isAdmin) {
      return (
        <div>
          <Navbar />
          <AdminOnly page="Verification Page." />
        </div>
      );
    }
    return (
      <div>
        <NavbarAdmin />
        <div className="container-main">
          <h2>Verification</h2>
          <div
            className="container-item attention"
            style={{ border: "1px solid" }}
          >
            <center>
              <div>
                <h4>Upload Voter Data</h4>
                <p style={{ fontSize: "14px", marginBottom: "15px" }}>
                  Upload a file containing voter information for distribution. 
                  Supported formats: CSV, Excel (XLS/XLSX), JSON, TXT
                </p>
                <input 
                  type="file" 
                  onChange={this.handleFileUpload} 
                  style={{ margin: "10px" }}
                />
                <button 
                  className="btn-verification approve" 
                  onClick={this.bulkRegisterVoters}
                  style={{ margin: "10px" }}
                  disabled={!this.state.fileList}
                >
                  Upload and Collect Voter Data
                </button>
                <p style={{ fontSize: "14px", marginTop: "10px" }}>
                  <strong>File Format:</strong> Must contain columns for name, address, and optionally phone<br/>
                  <strong>Note:</strong> This collects data for distribution. Voters must register themselves.
                </p>
              </div>
            </center>
          </div>
          
          {/* Render collected voter data with confirmation button */}
          {this.renderCollectedVoterData()}
          
          <small>Total Voters: {this.state.voters.length}</small>
          {this.state.voters.length < 1 ? (
            <div className="container-item info">None has registered yet.</div>
          ) : (
            <>
              <div className="container-item info">
                <center>List of registered voters</center>
              </div>
              {this.state.voters.map(this.renderUnverifiedVoters)}
            </>
          )}
        </div>
      </div>
    );
  }
}