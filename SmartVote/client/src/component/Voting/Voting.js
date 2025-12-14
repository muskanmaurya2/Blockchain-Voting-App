// Node modules
import React, { Component } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";
import getWeb3 from "../../getWeb3";
import Election from "../../contracts/Election.json";
import "./Voting.css";

export default class Voting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      candidateCount: undefined,
      candidates: [],
      isElStarted: false,
      isElEnded: false,
      currentVoter: {
        address: undefined,
        start: undefined,
        end: undefined,
        isVoted: false,
      },
      electionDetails: {
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: ""
      },
      timeRemaining: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      countdownInterval: null
    };
  }

  componentDidMount = async () => {
    // refreshing once
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

      // Get total number of candidates
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });

      // Get start and end values
      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      // Loading Candidates details
      for (let i = 1; i <= this.state.candidateCount; i++) {
        const candidate = await this.state.ElectionInstance.methods
          .candidateDetails(i - 1)
          .call();
        this.state.candidates.push({
          id: candidate.candidateId,
          header: candidate.header,
          slogan: candidate.slogan,
          logoUrl: candidate.logoUrl || "",
        });
      }
      this.setState({ candidates: this.state.candidates });

      // Loading current voter
      const voter = await this.state.ElectionInstance.methods
        .voterDetails(this.state.account)
        .call();
      this.setState({
        currentVoter: {
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        },
      });

      // Admin account and verification
      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Get election details
      const electionDetails = await this.state.ElectionInstance.methods
        .getElectionDetails()
        .call();
      this.setState({
        electionDetails: {
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

      // Start countdown timer if election is active
      if (start && !end) {
        this.startCountdown(electionDetails.endDate, electionDetails.endTime);
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  // Calculate time remaining until election ends
  calculateTimeRemaining = (endDate, endTime) => {
    // Combine date and time strings
    const endDateString = `${endDate}T${endTime}`;
    const endDateTime = new Date(endDateString).getTime();
    
    // Get current time
    const now = new Date().getTime();
    
    // Calculate difference
    const difference = endDateTime - now;
    
    // If election has ended
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    // Calculate time units
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  };

  // Start countdown interval
  startCountdown = (endDate, endTime) => {
    // Clear any existing interval
    if (this.state.countdownInterval) {
      clearInterval(this.state.countdownInterval);
    }
    
    // Set initial time remaining
    const timeRemaining = this.calculateTimeRemaining(endDate, endTime);
    this.setState({ timeRemaining });
    
    // Update countdown every second
    const interval = setInterval(() => {
      const timeRemaining = this.calculateTimeRemaining(endDate, endTime);
      this.setState({ timeRemaining });
      
      // Stop countdown when election ends
      if (timeRemaining.days === 0 && 
          timeRemaining.hours === 0 && 
          timeRemaining.minutes === 0 && 
          timeRemaining.seconds === 0) {
        clearInterval(this.state.countdownInterval);
        // Reload page to reflect election end
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }, 1000);
    
    this.setState({ countdownInterval: interval });
  };

  // Clean up interval on component unmount
  componentWillUnmount() {
    if (this.state.countdownInterval) {
      clearInterval(this.state.countdownInterval);
    }
  }

  renderCandidates = (candidate) => {
    const { t } = this.props; // Get translation function from props
    
    const castVote = async (id) => {
      try {
        await this.state.ElectionInstance.methods
          .vote(id)
          .send({ from: this.state.account, gas: 1000000 });
        alert(t ? t('vote_cast_successfully') : "Vote cast successfully!");
        window.location.reload();
      } catch (error) {
        console.error("Error casting vote:", error);
        alert(t ? t('failed_to_cast_vote') : "Failed to cast vote. Check console for details.");
      }
    };
    
    const confirmVote = (id, header) => {
      var r = window.confirm(
        (t ? t('confirm_vote_for') : "Vote for ") + header + (t ? t('with_id') : " with Id ") + id + ".\n" + (t ? t('are_you_sure') : "Are you sure?")
      );
      if (r === true) {
        castVote(id);
      }
    };
    
    return (
      <div className="container-item">
        <div className="candidate-card">
          {candidate.logoUrl && (
            <div className="candidate-logo-container">
              <img
                src={candidate.logoUrl}
                alt={candidate.header}
                className="candidate-logo"
              />
            </div>
          )}
          <div className="candidate-details">
            <div className="candidate-header">
              <span className="label-text">{t ? t('candidate_name') : 'Candidate Name:'}</span>
              <h2 className="candidate-name">
                {candidate.header} <small className="candidate-id">#{candidate.id}</small>
              </h2>
            </div>
            <div className="candidate-slogan-section">
              <span className="label-text">{t ? t('slogan') : 'Slogan:'}</span>
              <p className="slogan">"{candidate.slogan}"</p>
            </div>
            {candidate.logoUrl && (
              <div className="candidate-party-info">
                <span className="label-text">{t ? t('party_logo') : 'Party Logo:'}</span>
                <span className="info-text">{t ? t('displayed_above') : 'Displayed above'}</span>
              </div>
            )}
          </div>
        </div>
        <div className="vote-btn-container">
          <button
            onClick={() => confirmVote(candidate.id, candidate.header)}
            className="vote-bth"
            disabled={
              !this.state.currentVoter.isRegistered ||
              !this.state.currentVoter.isVerified ||
              this.state.currentVoter.hasVoted
            }
            title={
              !this.state.currentVoter.isRegistered
                ? (t ? t('please_register_first') : "Please register first")
                : !this.state.currentVoter.isVerified
                ? (t ? t('please_wait_for_verification') : "Please wait for admin verification")
                : this.state.currentVoter.hasVoted
                ? (t ? t('you_have_already_voted') : "You have already voted")
                : (t ? t('click_to_vote') : "Click to vote for this candidate")
            }
          >
            {t ? t('vote') : 'Vote'}
          </button>
        </div>
      </div>
    );
  };

  render() {
    const { t } = this.props; // Get translation function from props
    
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <center>{t ? t('loading_web3') : 'Loading Web3, accounts, and contract...'}</center>
        </>
      );
    }

    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        <div>
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          ) : this.state.isElStarted && !this.state.isElEnded ? (
            <>
              {/* Election Date/Time Information */}
              {this.state.electionDetails.startDate && (
                <div className="container-main">
                  <div className="election-info-banner">
                    <h3>📅 {t ? t('election_schedule') : 'Election Schedule'}</h3>
                    <div className="election-dates">
                      <div className="date-item">
                        <span className="date-label">{t ? t('starts') : 'Starts:'}</span>
                        <span className="date-value">
                          {this.state.electionDetails.startDate} {t ? t('at') : 'at'} {this.state.electionDetails.startTime}
                        </span>
                      </div>
                      <div className="date-item">
                        <span className="date-label">{t ? t('ends') : 'Ends:'}</span>
                        <span className="date-value">
                          {this.state.electionDetails.endDate} {t ? t('at') : 'at'} {this.state.electionDetails.endTime}
                        </span>
                      </div>
                    </div>
                    {/* Countdown Timer */}
                    <div className="countdown-timer">
                      <h3>⏰ {t ? t('time_remaining') : 'Time Remaining'}</h3>
                      <div className="timer-display">
                        <div className="time-unit">
                          <span className="time-value">{this.state.timeRemaining.days}</span>
                          <span className="time-label">{t ? t('days') : 'Days'}</span>
                        </div>
                        <div className="time-unit">
                          <span className="time-value">{this.state.timeRemaining.hours}</span>
                          <span className="time-label">{t ? t('hours') : 'Hours'}</span>
                        </div>
                        <div className="time-unit">
                          <span className="time-value">{this.state.timeRemaining.minutes}</span>
                          <span className="time-label">{t ? t('minutes') : 'Minutes'}</span>
                        </div>
                        <div className="time-unit">
                          <span className="time-value">{this.state.timeRemaining.seconds}</span>
                          <span className="time-label">{t ? t('seconds') : 'Seconds'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {this.state.currentVoter.isRegistered ? (
                this.state.currentVoter.isVerified ? (
                  this.state.currentVoter.hasVoted ? (
                    <div className="container-item success">
                      <div>
                        <strong>{t ? t('you_have_cast_your_vote') : 'You\'ve casted your vote.'}</strong>
                        <p />
                        <center>
                          <Link
                            to="/Results"
                            style={{
                              color: "black",
                              textDecoration: "underline",
                            }}
                          >
                            {t ? t('see_results') : 'See Results'}
                          </Link>
                        </center>
                      </div>
                    </div>
                  ) : (
                    <div className="container-item info">
                      <center>{t ? t('go_ahead_and_cast_your_vote') : 'Go ahead and cast your vote.'}</center>
                    </div>
                  )
                ) : (
                  <div className="container-item attention">
                    <center>{t ? t('please_wait_for_admin_verification') : 'Please wait for admin to verify.'}</center>
                  </div>
                )
              ) : (
                <>
                  <div className="container-item attention">
                    <center>
                      <p>{t ? t('you_are_not_registered') : 'You\'re not registered. Please register first.'}</p>
                      <br />
                      <Link
                        to="/Registration"
                        style={{ color: "black", textDecoration: "underline" }}
                      >
                        {t ? t('registration_page') : 'Registration Page'}
                      </Link>
                    </center>
                  </div>
                </>
              )}
              <div className="container-main">
                <h2>{t ? t('candidates') : 'Candidates'}</h2>
                <small>{t ? t('total_candidates') : 'Total candidates:'} {this.state.candidates.length}</small>
                {this.state.candidates.length < 1 ? (
                  <div className="container-item attention">
                    <center>{t ? t('no_candidates_to_vote_for') : 'Not one to vote for.'}</center>
                  </div>
                ) : (
                  <>
                    {this.state.candidates.map(this.renderCandidates)}
                    <div
                      className="container-item"
                      style={{ border: "1px solid black" }}
                    >
                      <center>{t ? t('that_is_all') : 'That is all.'}</center>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : !this.state.isElStarted && this.state.isElEnded ? (
            <>
              <div className="container-item attention">
                <center>
                  <h3>{t ? t('election_ended') : 'The Election ended.'}</h3>
                  <br />
                  <Link
                    to="/Results"
                    style={{ color: "black", textDecoration: "underline" }}
                  >
                    {t ? t('see_results') : 'See results'}
                  </Link>
                </center>
              </div>
            </>
          ) : null}
        </div>
      </>
    );
  }
}
