// Node modules
import React, { Component } from "react";
import { Link } from "react-router-dom";

// Components
import Navbar from "./Navbar/Navigation";
import NavbarAdmin from "./Navbar/NavigationAdmin";
import UserHome from "./UserHome";
import StartEnd from "./StartEnd";

// Contract
import getWeb3 from "../getWeb3";
import Election from "../contracts/Election.json";

// CSS
import "./Home.css";

// const buttonRef = React.createRef();
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      elStarted: false,
      elEnded: false,
      elDetails: {},
      showRegistrationPopup: false, // Controls visibility of registration popup
      // Manage Elections form fields
      electionTitle: "",
      organizationTitle: "",
      adminName: "",
      adminEmail: "",
      adminTitle: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      // Sign in state
      isLoggedIn: false,
      showSignInForm: false,
      signInEmail: "",
      signInPassword: ""
    };
  }

  // refreshing once
  componentDidMount = async () => {
    // Check if user is already logged in
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.setState({ isLoggedIn: loggedIn });
    
    // Check if this is the first visit
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited && !loggedIn) {
      // First visit - show popup
      this.setState({ showRegistrationPopup: true });
      sessionStorage.setItem('hasVisited', 'true');
    }
    
    // Don't reload the page if we're coming back from registration
    if (!window.location.hash.includes("#loaded")) {
      if (!window.location.hash) {
        window.location = window.location + "#loaded";
        window.location.reload();
      }
    }
    
    // If we've already loaded, don't reload again
    if (window.location.hash.includes("#loaded")) {
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

        // Only try to get admin if we have an instance
        if (instance) {
          const admin = await this.state.ElectionInstance.methods.getAdmin().call();
          if (this.state.account === admin) {
            this.setState({ isAdmin: true });
          }

          // Get election start and end values
          const start = await this.state.ElectionInstance.methods.getStart().call();
          this.setState({ elStarted: start });
          const end = await this.state.ElectionInstance.methods.getEnd().call();
          this.setState({ elEnded: end });

          // Getting election details from the contract
          const electionDetails = await this.state.ElectionInstance.methods
          .getElectionDetails()
          .call();
          
          this.setState({
            elDetails: {
              adminName: electionDetails.adminName,
              adminEmail: electionDetails.adminEmail,
              adminTitle: electionDetails.adminTitle,
              electionTitle: electionDetails.electionTitle,
              organizationTitle: electionDetails.organizationTitle,
              startDate: electionDetails.startDate,
              startTime: electionDetails.startTime,
              endDate: electionDetails.endDate,
              endTime: electionDetails.endTime,
            },
          });
        }
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    }
  };
  // end election
  endElection = async () => {
    await this.state.ElectionInstance.methods
      .endElection()
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };
  // register and start election
  registerElection = async (data) => {
    try {
      await this.state.ElectionInstance.methods
        .setElectionDetails(
          data.adminFName.toLowerCase() + " " + data.adminLName.toLowerCase(),
          data.adminEmail.toLowerCase(),
          data.adminTitle.toLowerCase(),
          data.electionTitle.toLowerCase(),
          data.organizationTitle.toLowerCase(),
          data.startDate,
          data.startTime,
          data.endDate,
          data.endTime
        )
        .send({ from: this.state.account, gas: 1000000 });
      window.location.reload();
    } catch (error) {
      console.error("Error starting election:", error);
      alert("Failed to start election. Check console for details.");
    }
  };

  // Handle Manage Elections form changes
  updateElectionTitle = (e) => {
    this.setState({ electionTitle: e.target.value });
  };

  updateOrganizationTitle = (e) => {
    this.setState({ organizationTitle: e.target.value });
  };

  updateAdminName = (e) => {
    this.setState({ adminName: e.target.value });
  };

  updateAdminEmail = (e) => {
    this.setState({ adminEmail: e.target.value });
  };

  updateAdminTitle = (e) => {
    this.setState({ adminTitle: e.target.value });
  };

  updateStartDate = (e) => {
    this.setState({ startDate: e.target.value });
  };

  updateStartTime = (e) => {
    this.setState({ startTime: e.target.value });
  };

  updateEndDate = (e) => {
    this.setState({ endDate: e.target.value });
  };

  updateEndTime = (e) => {
    this.setState({ endTime: e.target.value });
  };

  // Handle Manage Elections form submission
  handleCreateElection = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!this.state.adminName || !this.state.adminEmail || !this.state.adminTitle ||
        !this.state.electionTitle || !this.state.organizationTitle ||
        !this.state.startDate || !this.state.startTime || 
        !this.state.endDate || !this.state.endTime) {
      alert("Please fill in all required fields.");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.state.adminEmail)) {
      alert("Please enter a valid email address.");
      return;
    }
    
    try {
      await this.state.ElectionInstance.methods
        .setElectionDetails(
          this.state.adminName.toLowerCase(),
          this.state.adminEmail.toLowerCase(),
          this.state.adminTitle.toLowerCase(),
          this.state.electionTitle.toLowerCase(),
          this.state.organizationTitle.toLowerCase(),
          this.state.startDate,
          this.state.startTime,
          this.state.endDate,
          this.state.endTime
        )
        .send({ from: this.state.account, gas: 1000000 });
      
      // Reset form fields
      this.setState({
        electionTitle: "",
        organizationTitle: "",
        adminName: "",
        adminEmail: "",
        adminTitle: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: ""
      });
      
      alert("Election created successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error creating election:", error);
      alert("Failed to create election. Check console for details.");
    }
  };

  // Close registration popup
  closeRegistrationPopup = () => {
    this.setState({ showRegistrationPopup: false });
  };

  // Handle registration selection
  handleRegistrationSelection = (type) => {
    this.closeRegistrationPopup();
    if (type === 'admin') {
      window.location.href = "/ManageElections";
    } else if (type === 'user') {
      window.location.href = "/Registration";
    }
  };

  // Sign in functions
  toggleSignInForm = () => {
    this.setState({ showSignInForm: !this.state.showSignInForm });
  };

  handleSignInChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSignIn = (e) => {
    e.preventDefault();
    // Simple validation - in a real app, you would authenticate with a server
    if (this.state.signInEmail && this.state.signInPassword) {
      this.setState({ 
        isLoggedIn: true, 
        showSignInForm: false,
        signInEmail: "",
        signInPassword: ""
      });
      localStorage.setItem('isLoggedIn', 'true');
      alert("Signed in successfully!");
    } else {
      alert("Please enter both email and password.");
    }
  };

  handleSignOut = () => {
    this.setState({ isLoggedIn: false });
    localStorage.removeItem('isLoggedIn');
    alert("Signed out successfully!");
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          <Navbar />
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }
    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        
        {/* Registration Popup */}
        {this.state.showRegistrationPopup && (
          <div className="registration-popup-overlay">
            <div className="registration-popup">
              <h2>Welcome to SmartVote</h2>
              <p>Please select your registration type:</p>
              <div className="popup-buttons">
                <button 
                  className="popup-button admin-button"
                  onClick={() => this.handleRegistrationSelection('admin')}
                >
                  🛠️ Admin Registration
                </button>
                <button 
                  className="popup-button user-button"
                  onClick={() => this.handleRegistrationSelection('user')}
                >
                  👤 User Registration
                </button>
                <button 
                  className="popup-button cancel-button"
                  onClick={this.closeRegistrationPopup}
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Sign In Form */}
        {this.state.showSignInForm && (
          <div className="registration-popup-overlay">
            <div className="registration-popup">
              <h2>Sign In</h2>
              <div className="account-info">
                Your Account: {this.state.account}
              </div>
              <form onSubmit={this.handleSignIn}>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="signInEmail"
                    value={this.state.signInEmail}
                    onChange={this.handleSignInChange}
                    className="input-home"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type="password"
                    name="signInPassword"
                    value={this.state.signInPassword}
                    onChange={this.handleSignInChange}
                    className="input-home"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div className="popup-buttons">
                  <button type="submit" className="popup-button admin-button">
                    Sign In
                  </button>
                  <button 
                    type="button" 
                    className="popup-button cancel-button"
                    onClick={this.toggleSignInForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        <div className="container-main">
          {!this.state.elStarted & !this.state.elEnded ? (
            <div className="container-item info">
              <center>
                <h2>🚀 Election Setup Guidelines</h2>
                
                <div className="setup-guide">
                  <div className="guide-step">
                    <h3>1. Sign-In & Admin Profile</h3>
                    <p>Sign in and complete the About Admin profile with your official name and contact details for system support.</p>
                  </div>
                  
                  <div className="guide-step">
                    <h3>2. Define Election</h3>
                    <p>Fill out the About Election form, setting the Title, Organization, and crucial Start/End Date & Time.</p>
                  </div>
                  
                  <div className="guide-step">
                    <h3>3. Add Candidates</h3>
                    <p>Navigate to the Add Candidate tab to input the Name and Position for every person running in the election.</p>
                  </div>
                  
                  <div className="guide-step">
                    <h3>4. Verify Voters (Voter Roll)</h3>
                    <p>📤 Use the Verification tab to upload your list of eligible voters, preferably using a standardized CSV or Excel file.</p>
                  </div>
                </div>
              </center>
            </div>
          ) : null}
        </div>
        {this.state.isAdmin ? (
          <>
            <this.renderAdminHome />
            {/* Manage Elections Section - Show after election is created */}
            {(this.state.elStarted || this.state.elEnded) && (
              <div className="container-main">
                <h2>Manage Elections</h2>
                
                {/* Create New Election Form */}
                <div className="container-item info">
                  <center><h3>Create New Election</h3></center>
                  <form className="form" onSubmit={this.handleCreateElection}>
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
              </div>
            )}
          </>
        ) : this.state.elStarted ? (
          <>
            <UserHome el={this.state.elDetails} />
          </>
        ) : !this.state.isElStarted && this.state.isElEnded ? (
          <>
            <div className="container-item attention">
              <center>
                <h3>The Election ended.</h3>
                <br />
                <Link
                  to="/Results"
                  style={{ color: "black", textDecoration: "underline" }}
                >
                  See results
                </Link>
              </center>
            </div>
          </>
        ) : null}
      </>
    );
  }

  renderAdminHome = () => {
    const EMsg = (props) => {
      return <span style={{ color: "tomato" }}>{props.msg}</span>;
    };

    const AdminHome = () => {
      // Contains of Home page for the Admin
      const [formData, setFormData] = React.useState({
        adminFName: '',
        adminLName: '',
        adminEmail: '',
        adminTitle: '',
        electionTitle: '',
        organizationTitle: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
      });
      const [errors, setErrors] = React.useState({});

      const handleChange = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
      };

      const validateForm = () => {
        const newErrors = {};
        if (!formData.adminFName) newErrors.adminFName = true;
        if (!formData.adminEmail) {
          newErrors.adminEmail = { message: '*Required' };
        } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(formData.adminEmail)) {
          newErrors.adminEmail = { message: '*Invalid' };
        }
        if (!formData.adminTitle) newErrors.adminTitle = true;
        if (!formData.electionTitle) newErrors.electionTitle = true;
        if (!formData.organizationTitle) newErrors.organizationName = true;
        if (!formData.startDate) newErrors.startDate = true;
        if (!formData.startTime) newErrors.startTime = true;
        if (!formData.endDate) newErrors.endDate = true;
        if (!formData.endTime) newErrors.endTime = true;
        return newErrors;
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length === 0) {
          this.registerElection(formData);
        } else {
          setErrors(newErrors);
          alert("Please fill in all required fields correctly.");
        }
      };

      return (
        <div>
          <form onSubmit={handleSubmit}>
            {!this.state.elStarted & !this.state.elEnded ? (
              <div className="container-main">
                {/* Sign in/Sign out buttons */}
                <div className="auth-buttons">
                  {this.state.isLoggedIn ? (
                    <button 
                      type="button" 
                      className="btn-add"
                      onClick={this.handleSignOut}
                      style={{ backgroundColor: '#dc3545', float: 'right' }}
                    >
                      Logout
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="btn-add"
                      onClick={this.toggleSignInForm}
                      style={{ float: 'right' }}
                    >
                      Sign In
                    </button>
                  )}
                </div>
                
                {/* about-admin */}
                <div className="about-admin">
                  <h3>About Admin</h3>
                  <div className="container-item center-items">
                    <div className="form-grid">
                      <div className="form-row">
                        <div className="form-group">
                          <label className="label-home">
                            Full Name{" "}
                            {errors.adminFName && <EMsg msg="*required" />}
                            <div className="input-group">
                              <input
                                className="input-home"
                                type="text"
                                placeholder="First Name"
                                name="adminFName"
                                value={formData.adminFName}
                                onChange={handleChange}
                              />
                              <input
                                className="input-home"
                                type="text"
                                placeholder="Last Name"
                                name="adminLName"
                                value={formData.adminLName}
                                onChange={handleChange}
                              />
                            </div>
                          </label>
                        </div>
                        
                        <div className="form-group">
                          <label className="label-home">
                            Email{" "}
                            {errors.adminEmail && (
                              <EMsg msg={errors.adminEmail.message} />
                            )}
                            <input
                              className="input-home"
                              placeholder="eg. you@example.com"
                              name="adminEmail"
                              value={formData.adminEmail}
                              onChange={handleChange}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="label-home">
                          Job Title or Position{" "}
                          {errors.adminTitle && <EMsg msg="*required" />}
                          <input
                            className="input-home"
                            type="text"
                            placeholder="eg. HR Head "
                            name="adminTitle"
                            value={formData.adminTitle}
                            onChange={handleChange}
                          />
                        </label>
                      </div>
                      
                      <div className="form-group">
                        <label className="label-home">
                          Admin ID
                          <input
                            className="input-home"
                            type="text"
                            value={this.state.account}
                            readOnly
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                {/* about-election */}
                <div className="about-election">
                  <h3>About Election</h3>
                  <div className="container-item center-items">
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="label-home">
                          Election Title{" "}
                          {errors.electionTitle && <EMsg msg="*required" />}
                          <input
                            className="input-home"
                            type="text"
                            placeholder="eg. School Election"
                            name="electionTitle"
                            value={formData.electionTitle}
                            onChange={handleChange}
                          />
                        </label>
                      </div>
                      
                      <div className="form-group">
                        <label className="label-home">
                          Organization Name{" "}
                          {errors.organizationName && <EMsg msg="*required" />}
                          <input
                            className="input-home"
                            type="text"
                            placeholder="eg. Lifeline Academy"
                            name="organizationTitle"
                            value={formData.organizationTitle}
                            onChange={handleChange}
                          />
                        </label>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label className="label-home">
                            Start Date & Time{" "}
                            {errors.startDate && <EMsg msg="*required" />}
                            {errors.startTime && <EMsg msg="*required" />}
                            <div className="input-group">
                              <input
                                className="input-home"
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                              />
                              <input
                                className="input-home"
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                              />
                            </div>
                          </label>
                        </div>
                        
                        <div className="form-group">
                          <label className="label-home">
                            End Date & Time{" "}
                            {errors.endDate && <EMsg msg="*required" />}
                            {errors.endTime && <EMsg msg="*required" />}
                            <div className="input-group">
                              <input
                                className="input-home"
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                              />
                              <input
                                className="input-home"
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                              />
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : this.state.elStarted ? (
              <UserHome el={this.state.elDetails} />
            ) : null}
            <StartEnd
              elStarted={this.state.elStarted}
              elEnded={this.state.elEnded}
              endElFn={this.endElection}
            />
          </form>
        </div>
      );
    };
    return <AdminHome />;
  };
}