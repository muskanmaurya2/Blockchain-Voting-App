// Node modules
import React, { Component } from "react";
import NavbarAdmin from "../../Navbar/NavigationAdmin";
import Navbar from "../../Navbar/Navigation";
import AdminOnly from "../../AdminOnly";
import getWeb3 from "../../../getWeb3";
import Election from "../../../contracts/Election.json";
import "./AddCandidate.css";

export default class AddCandidate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      web3: null,
      accounts: null,
      account: null,
      isAdmin: false,
      header: "",
      slogan: "",
      logoUrl: "",
      logoPreview: null,
      candidates: [],
      candidateCount: undefined,
    };
  }

  componentDidMount = async () => {
    // refreshing page only once
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
      
      if (!deployedNetwork) {
        throw new Error(`Contract not deployed on network ${networkId}`);
      }
      
      console.log("Network ID:", networkId);
      console.log("Contract address:", deployedNetwork.address);

      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );
      
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3: web3,
        ElectionInstance: instance,
        account: accounts[0],
      });

      console.log("Connected account:", accounts[0]);

      // Total number of candidates
      const candidateCount = await instance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });

      const admin = await instance.methods.getAdmin().call();
      console.log("Admin address:", admin);
      console.log("Is current account admin?", accounts[0] === admin);
      
      if (accounts[0] === admin) {
        this.setState({ isAdmin: true });
      }

      // Loading Candidates details
      let candidatesArray = [];
      for (let i = 0; i < candidateCount; i++) {
        const candidate = await instance.methods
          .candidateDetails(i)
          .call();
        candidatesArray.push({
          id: candidate.candidateId,
          header: candidate.header,
          slogan: candidate.slogan,
          logoUrl: candidate.logoUrl || "",
        });
      }

      this.setState({ candidates: candidatesArray });
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
    }
  };

  updateHeader = (event) => {
    this.setState({ header: event.target.value });
  };
  
  updateSlogan = (event) => {
    this.setState({ slogan: event.target.value });
  };

  updateLogo = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 100KB)
      if (file.size > 100000) {
        alert("Image size should be less than 100KB. Please compress your image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState({
          logoUrl: reader.result,
          logoPreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  addCandidate = async (e) => {
    e.preventDefault(); // Prevent form default submission
    
    // Validation
    if (!this.state.header || this.state.header.length < 3) {
      alert("Candidate name must be at least 3 characters long.");
      return;
    }
    if (this.state.header.length > 21) {
      alert("Candidate name must be less than 21 characters.");
      return;
    }
    if (!this.state.slogan) {
      alert("Please provide a campaign slogan for the candidate.");
      return;
    }

    try {
      console.log("Adding candidate:", {
        header: this.state.header,
        slogan: this.state.slogan,
        logoUrl: this.state.logoUrl ? "Image provided" : "No image",
        account: this.state.account,
      });

      // Estimate gas first
      const gasEstimate = await this.state.ElectionInstance.methods
        .addCandidate(this.state.header, this.state.slogan, this.state.logoUrl || "")
        .estimateGas({ from: this.state.account });
      
      console.log("Estimated gas:", gasEstimate);

      const receipt = await this.state.ElectionInstance.methods
        .addCandidate(this.state.header, this.state.slogan, this.state.logoUrl || "")
        .send({ 
          from: this.state.account, 
          gas: Math.floor(gasEstimate * 1.5) // 50% buffer
        });
      
      console.log("Transaction receipt:", receipt);
      alert("Candidate added successfully!");
      // Reset form
      this.setState({
        header: "",
        slogan: "",
        logoUrl: "",
        logoPreview: null
      });
      // Refresh candidates list
      this.refreshCandidates();
    } catch (error) {
      console.error("Error adding candidate:", error);
      
      // Better error messages
      if (error.message.includes("revert")) {
        alert("Transaction failed: Only admin can add candidates. Make sure you're connected with the admin account.");
      } else if (error.message.includes("gas")) {
        alert("Transaction failed: Not enough gas. Please try again.");
      } else if (error.code === 4001) {
        alert("Transaction rejected by user.");
      } else {
        alert("Error adding candidate: " + error.message);
      }
    }
  };

  refreshCandidates = async () => {
    try {
      // Refresh candidate count
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });

      // Refresh candidates list
      let candidatesArray = [];
      for (let i = 0; i < candidateCount; i++) {
        const candidate = await this.state.ElectionInstance.methods
          .candidateDetails(i)
          .call();
        candidatesArray.push({
          id: candidate.candidateId,
          header: candidate.header,
          slogan: candidate.slogan,
          logoUrl: candidate.logoUrl || "",
        });
      }

      this.setState({ candidates: candidatesArray });
    } catch (error) {
      console.error("Error refreshing candidates:", error);
    }
  };

  render() {
    if (!this.state.web3) {
      return (
        <div>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <center>Loading Web3, accounts, and contract...</center>
        </div>
      );
    }
    if (!this.state.isAdmin) {
      return (
        <div>
          <Navbar />
          <AdminOnly page="Add Candidate Page." />
        </div>
      );
    }
    return (
      <div>
        <NavbarAdmin />
        <div className="container-main">
          <h2>Add Candidate</h2>
          <div className="container-item">
            <form className="form" onSubmit={this.addCandidate}>
              <label className={"label-ac"}>
                Candidate Name
                <input
                  className={
                    this.state.header && (this.state.header.length < 3 || this.state.header.length > 21)
                      ? "input-ac input-error"
                      : "input-ac"
                  }
                  type="text"
                  placeholder="eg. Marcus"
                  value={this.state.header}
                  onChange={this.updateHeader}
                />
                {this.state.header && this.state.header.length > 0 && (
                  <small style={{ color: this.state.header.length >= 3 && this.state.header.length <= 21 ? "green" : "red" }}>
                    {this.state.header.length} / 21 characters
                  </small>
                )}
              </label>
              <label className={"label-ac"}>
                Campaign Slogan
                <input
                  className={"input-ac"}
                  type="text"
                  placeholder="eg. It is what it is"
                  value={this.state.slogan}
                  onChange={this.updateSlogan}
                />
              </label>
              <label className={"label-ac"}>
                Party Logo
                <input
                  className={"input-ac"}
                  type="file"
                  accept="image/*"
                  onChange={this.updateLogo}
                />
              </label>
              {this.state.logoPreview && (
                <div className="logo-preview-container">
                  <p className="preview-label">Logo Preview:</p>
                  <img
                    src={this.state.logoPreview}
                    alt="Logo Preview"
                    className="logo-preview"
                  />
                </div>
              )}
              <button
                className="btn-add"
                disabled={
                  !this.state.header || 
                  this.state.header.length < 3 || 
                  this.state.header.length > 21 || 
                  !this.state.slogan
                }
                type="submit"
                title={
                  !this.state.header
                    ? "Candidate name is required"
                    : this.state.header.length < 3
                    ? "Candidate name must be at least 3 characters"
                    : this.state.header.length > 21
                    ? "Candidate name must be less than 21 characters"
                    : !this.state.slogan
                    ? "Campaign Slogan is required"
                    : "Add candidate"
                }
              >
                Add
              </button>
            </form>
          </div>
          
          {/* Display added candidates */}
          <div className="container-main">
            <h2>Added Candidates</h2>
            {this.state.candidates.length === 0 ? (
              <div className="container-item info">
                <center>No candidates added yet.</center>
              </div>
            ) : (
              <div className="container-list">
                {this.state.candidates.map((candidate) => (
                  <div key={candidate.id} className="container-item candidate-item">
                    <div className="candidate-details">
                      {candidate.logoUrl && (
                        <img
                          src={candidate.logoUrl}
                          alt={candidate.header}
                          className="candidate-logo-small"
                        />
                      )}
                      <div>
                        <div><strong>Candidate ID:</strong> {candidate.id}</div>
                        <div><strong>Name:</strong> {candidate.header}</div>
                        <div><strong>Slogan:</strong> {candidate.slogan}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export function loadAdded(candidates) {
  const renderAdded = (candidate) => {
    return (
      <>
        <div className="container-list success">
          <div className="candidate-item">
            {candidate.logoUrl && (
              <img
                src={candidate.logoUrl}
                alt={candidate.header}
                className="candidate-logo-small"
              />
            )}
            <div className="candidate-info">
              {candidate.id}. <strong>{candidate.header}</strong>:{" "}
              {candidate.slogan}
            </div>
          </div>
        </div>
      </>
    );
  };
  return (
    <div className="container-main">
      <div className="sub-container">
        <h2>Added Candidates</h2>
        <small>Total candidates: {candidates.length}</small>
        {candidates.map(renderAdded)}
      </div>
    </div>
  );
}