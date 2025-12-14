import React, { Component } from "react";
import NavbarAdmin from "../../Navbar/NavigationAdmin";
import Navbar from "../../Navbar/Navigation";
import AdminOnly from "../../AdminOnly";
import getWeb3 from "../../../getWeb3";
import Election from "../../../contracts/Election.json";
import "./ManageElections.css";

export default class ManageElections extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      elections: [],
      // Form fields
      electionTitle: "",
      organizationTitle: "",
      adminName: "",
      adminEmail: "",
      adminTitle: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: ""
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

      // Admin account and verification
      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // For now, we'll just show the current election
      // In a future version, this could be expanded to show multiple elections
      const electionDetails = await this.state.ElectionInstance.methods
        .getElectionDetails()
        .call();

      const isStarted = await this.state.ElectionInstance.methods
        .getStart()
        .call();

      const isEnded = await this.state.ElectionInstance.methods
        .getEnd()
        .call();

      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();

      const voterCount = await this.state.ElectionInstance.methods
        .getTotalVoter()
        .call();

      // Combine blockchain data with mock data for demonstration
      const blockchainElection = {
        id: 0,
        title: electionDetails.electionTitle,
        organization: electionDetails.organizationTitle,
        adminName: electionDetails.adminName,
        startDate: electionDetails.startDate,
        startTime: electionDetails.startTime,
        endDate: electionDetails.endDate,
        endTime: electionDetails.endTime,
        status: isEnded ? "Completed" : isStarted ? "Active" : "Upcoming",
        candidates: candidateCount,
        voters: voterCount
      };

      this.setState({
        elections: [blockchainElection, ...this.state.mockElections]
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  // Method to get different colors for election boxes
  getElectionBoxColor = (index) => {
    // Define our color palette from the CSS variables
    const colors = [
      "#B298E7", // Lavender Purple
      "#B8E3E9", // Powder Blue
      "#F5B8D5", // Light Rose Pink
      "#F9BEDD", // Baby Pink
      "#DDFFFF", // Light Cyan
      "#E6E6FA", // Lavender
      "#FFE4E1", // Misty Rose
      "#E0FFFF"  // Light Cyan
    ];
    
    // Return a color based on the index, cycling through the colors
    return colors[index % colors.length];
  };

  // Form update methods
  updateElectionTitle = (event) => {
    this.setState({ electionTitle: event.target.value });
  };

  updateOrganizationTitle = (event) => {
    this.setState({ organizationTitle: event.target.value });
  };

  updateAdminName = (event) => {
    this.setState({ adminName: event.target.value });
  };

  updateAdminEmail = (event) => {
    this.setState({ adminEmail: event.target.value });
  };

  updateAdminTitle = (event) => {
    this.setState({ adminTitle: event.target.value });
  };

  updateStartDate = (event) => {
    this.setState({ startDate: event.target.value });
  };

  updateStartTime = (event) => {
    this.setState({ startTime: event.target.value });
  };

  updateEndDate = (event) => {
    this.setState({ endDate: event.target.value });
  };

  updateEndTime = (event) => {
    this.setState({ endTime: event.target.value });
  };

  // Search and filter methods
  updateSearchTerm = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  updateStatusFilter = (event) => {
    this.setState({ statusFilter: event.target.value });
  };

  updateDateFilter = (event) => {
    this.setState({ dateFilter: event.target.value });
  };

  updateSortBy = (event) => {
    this.setState({ sortBy: event.target.value });
  };

  // Create new election
  createElection = async () => {
    try {
      // Validation
      if (!this.state.electionTitle || !this.state.organizationTitle) {
        alert("Please fill in all required fields.");
        return;
      }

      if (!this.state.startDate || !this.state.startTime || !this.state.endDate || !this.state.endTime) {
        alert("Please fill in all date and time fields.");
        return;
      }

      // Create election (in current implementation, this updates the existing election)
      await this.state.ElectionInstance.methods
        .setElectionDetails(
          this.state.adminName,
          this.state.adminEmail,
          this.state.adminTitle,
          this.state.electionTitle,
          this.state.organizationTitle,
          this.state.startDate,
          this.state.startTime,
          this.state.endDate,
          this.state.endTime
        )
        .send({ from: this.state.account, gas: 1000000 });

      // Send admin confirmation email
      this.sendAdminConfirmationEmail();

      alert("Election created successfully!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Error creating election. Check console for details.");
    }
  };

  // Send admin confirmation email
  sendAdminConfirmationEmail = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/send-admin-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminName: this.state.adminName,
          adminEmail: this.state.adminEmail,
          electionTitle: this.state.electionTitle,
          organizationName: this.state.organizationTitle
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Admin confirmation email sent successfully');
      } else {
        console.error('Failed to send admin confirmation email:', result.message);
      }
    } catch (error) {
      console.error('Error sending admin confirmation email:', error);
    }
  };

  handleCreateClick = (e) => {
    e.preventDefault();
    this.createElection();
  };

  // View election details
  viewElectionDetails = (election) => {
    this.setState({
      selectedElection: election,
      showElectionDetails: true
    });
  };

  // Close election details
  closeElectionDetails = () => {
    this.setState({
      selectedElection: null,
      showElectionDetails: false
    });
  };

  // End election
  endElection = async (electionId) => {
    try {
      // For blockchain elections (id === 0), we can actually end the election
      if (electionId === 0 && this.state.ElectionInstance) {
        await this.state.ElectionInstance.methods
          .endElection()
          .send({ from: this.state.account, gas: 1000000 });
        
        alert("Election ended successfully!");
        
        // Update the election status in state
        const updatedElections = this.state.elections.map(election => {
          if (election.id === 0) {
            return { ...election, status: "Completed" };
          }
          return election;
        });
        
        this.setState({ elections: updatedElections });
      } else {
        // For mock elections, just show a message
        alert("In a real implementation, this would end the election. For demo purposes, the status has been updated.");
        
        // Update the election status in state for mock elections
        const updatedElections = this.state.elections.map(election => {
          if (election.id === electionId) {
            return { ...election, status: "Completed" };
          }
          return election;
        });
        
        this.setState({ elections: updatedElections });
      }
    } catch (error) {
      console.error(error);
      alert("Error ending election. Check console for details.");
    }
  };

  // Filter and sort elections
  getFilteredAndSortedElections = () => {
    let filteredElections = [...this.state.elections];

    // Apply search filter
    if (this.state.searchTerm) {
      const term = this.state.searchTerm.toLowerCase();
      filteredElections = filteredElections.filter(election => 
        election.title.toLowerCase().includes(term) || 
        election.id.toString().includes(term)
      );
    }

    // Apply status filter
    if (this.state.statusFilter !== "All Elections") {
      filteredElections = filteredElections.filter(election => 
        election.status === this.state.statusFilter
      );
    }

    // Apply date filter (simplified for demo)
    if (this.state.dateFilter !== "Last 30 Days") {
      // In a real implementation, this would filter by date ranges
      // For now, we'll just show all elections regardless of date filter
    }

    // Apply sorting
    switch (this.state.sortBy) {
      case "Title (A-Z)":
        filteredElections.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "Status":
        filteredElections.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case "Start Date (Newest)":
      default:
        // Sort by start date (newest first)
        filteredElections.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        break;
    }

    return filteredElections;
  };

  renderElectionDetails = () => {
    if (!this.state.showElectionDetails || !this.state.selectedElection) {
      return null;
    }

    const election = this.state.selectedElection;

    return (
      <div className="election-details-modal" style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div className="election-details-content" style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative"
        }}>
          <button 
            onClick={this.closeElectionDetails}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#555"
            }}
          >
            &times;
          </button>
          
          <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>{election.title}</h2>
          
          <div style={{ marginBottom: "15px" }}>
            <strong>Organization:</strong> {election.organization}
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <strong>Admin:</strong> {election.adminName}
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <strong>Status:</strong> 
            <span style={{ 
              color: election.status === "Active" ? "green" : 
                    election.status === "Completed" ? "red" : 
                    "orange", 
              fontWeight: "bold",
              marginLeft: "5px"
            }}>
              {election.status}
            </span>
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <strong>Schedule:</strong> {election.startDate} {election.startTime} - {election.endDate} {election.endTime}
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <strong>Number of Candidates:</strong> {election.candidates}
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <strong>Number of Voters:</strong> {election.voters}
          </div>
          
          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button 
              className="btn-action"
              onClick={this.closeElectionDetails}
            >
              Close
            </button>
            
            {election.status === "Active" && (
              <button 
                className="btn-action btn-end"
                onClick={() => {
                  this.endElection(election.id);
                  this.closeElectionDetails();
                }}
              >
                End Election
              </button>
            )}
          </div>
        </div>
      </div>
    );
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
          <AdminOnly page="Manage Elections Page." />
        </div>
      );
    }

    const filteredElections = this.getFilteredAndSortedElections();

    return (
      <div>
        <NavbarAdmin />
        <div className="container-main">
          <h2>Manage Elections</h2>
          
          {/* Create New Election Form */}
          <div className="container-item info">
            <center><h3>Create New Election</h3></center>
            <form className="form" onSubmit={this.handleCreateClick}>
              {/* About Admin */}
              <div className="about-admin">
                <h4>About Admin</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="label-ac">
                      Full Name *
                    </label>
                    <input
                      className="input-ac"
                      type="text"
                      placeholder="eg. John Doe"
                      name="adminName"
                      value={this.state.adminName}
                      onChange={this.updateAdminName}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label-ac">
                      Email *
                    </label>
                    <input
                      className="input-ac"
                      placeholder="eg. you@example.com"
                      name="adminEmail"
                      value={this.state.adminEmail}
                      onChange={this.updateAdminEmail}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label-ac">
                      Job Title or Position *
                    </label>
                    <input
                      className="input-ac"
                      type="text"
                      placeholder="eg. HR Head "
                      name="adminTitle"
                      value={this.state.adminTitle}
                      onChange={this.updateAdminTitle}
                    />
                  </div>
                </div>
              </div>

              {/* About Election */}
              <div className="about-election">
                <h4>About Election</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="label-ac">
                      Election Title *
                    </label>
                    <input
                      className="input-ac"
                      type="text"
                      placeholder="eg. School Election"
                      name="electionTitle"
                      value={this.state.electionTitle}
                      onChange={this.updateElectionTitle}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label-ac">
                      Organization Name *
                    </label>
                    <input
                      className="input-ac"
                      type="text"
                      placeholder="eg. Lifeline Academy"
                      name="organizationTitle"
                      value={this.state.organizationTitle}
                      onChange={this.updateOrganizationTitle}
                    />
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="schedule">
                <h4>Schedule</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="label-ac">
                      Start Date *
                    </label>
                    <input
                      className="input-ac"
                      type="date"
                      name="startDate"
                      value={this.state.startDate}
                      onChange={this.updateStartDate}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label-ac">
                      Start Time *
                    </label>
                    <input
                      className="input-ac"
                      type="time"
                      name="startTime"
                      value={this.state.startTime}
                      onChange={this.updateStartTime}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label-ac">
                      End Date *
                    </label>
                    <input
                      className="input-ac"
                      type="date"
                      name="endDate"
                      value={this.state.endDate}
                      onChange={this.updateEndDate}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label-ac">
                      End Time *
                    </label>
                    <input
                      className="input-ac"
                      type="time"
                      name="endTime"
                      value={this.state.endTime}
                      onChange={this.updateEndTime}
                    />
                  </div>
                </div>
              </div>

              <button
                className="btn-add"
                type="submit"
              >
                Create Election
              </button>
            </form>
          </div>

          {/* Search and Filter Section */}
          <div className="container-item info">
            <center><h3>Election Management</h3></center>
            <div className="search-filter-section" style={{ padding: "20px" }}>
              {/* Search Bar */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Search by Title or ID:
                </label>
                <input
                  type="text"
                  placeholder="Enter election title or ID..."
                  value={this.state.searchTerm}
                  onChange={this.updateSearchTerm}
                  className="input-ac"
                  style={{ width: "100%" }}
                />
              </div>

              {/* Filters Row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="label-ac">Filter by Status:</label>
                  <select 
                    value={this.state.statusFilter} 
                    onChange={this.updateStatusFilter}
                    className="input-ac"
                  >
                    <option value="All Elections">All Elections (Default)</option>
                    <option value="Active">Active Only</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label-ac">Filter by Date:</label>
                  <select 
                    value={this.state.dateFilter} 
                    onChange={this.updateDateFilter}
                    className="input-ac"
                  >
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="This Year">This Year</option>
                    <option value="Scheduled Next Month">Scheduled Next Month</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label-ac">Sort By:</label>
                  <select 
                    value={this.state.sortBy} 
                    onChange={this.updateSortBy}
                    className="input-ac"
                  >
                    <option value="Start Date (Newest)">Start Date (Newest) (Default)</option>
                    <option value="Title (A-Z)">Title (A-Z)</option>
                    <option value="Status">Status</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Elections List */}
          <div className="container-main" style={{ borderTop: "1px solid" }}>
            <div className="container-item info">
              <center><h3>Current Elections ({filteredElections.length})</h3></center>
            </div>
            {filteredElections.length < 1 ? (
              <div className="container-item alert">
                <center>No elections found matching your criteria.</center>
              </div>
            ) : (
              <div
                className="container-item"
                style={{
                  display: "block",
                  backgroundColor: "#DDFFFF",
                }}
              >
                {filteredElections.map((election, index) => (
                  <div 
                    className="election-box" 
                    key={election.id}
                    style={{
                      // Different color for each election box based on index
                      backgroundColor: this.getElectionBoxColor(index),
                      marginBottom: "15px",
                      borderRadius: "10px",
                      padding: "20px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <div className="election-item">
                      <div className="election-info">
                        <h3 style={{ color: "#2c3e50", marginBottom: "10px" }}>{election.title}</h3>
                        <p><strong>Organization:</strong> {election.organization}</p>
                        <p><strong>Admin:</strong> {election.adminName}</p>
                        <p><strong>Status:</strong> 
                          <span style={{ 
                            color: election.status === "Active" ? "green" : 
                                  election.status === "Completed" ? "red" : 
                                  "orange", 
                            fontWeight: "bold" 
                          }}> {election.status}</span>
                        </p>
                        <p><strong>Schedule:</strong> {election.startDate} {election.startTime} - {election.endDate} {election.endTime}</p>
                        <p><strong>Candidates:</strong> {election.candidates} | <strong>Voters:</strong> {election.voters}</p>
                      </div>
                      <div className="election-actions">
                        <button 
                          className="btn-action"
                          onClick={() => this.viewElectionDetails(election)}
                        >
                          View Details
                        </button>
                        {election.status === "Upcoming" && (
                          <button className="btn-action btn-edit">Edit</button>
                        )}
                        {election.status === "Active" && (
                          <button 
                            className="btn-action btn-end"
                            onClick={() => this.endElection(election.id)}
                          >
                            End Election
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Election Details Modal */}
        {this.renderElectionDetails()}
      </div>
    );
  }
}