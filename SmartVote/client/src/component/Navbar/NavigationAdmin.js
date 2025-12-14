import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import "./Navbar.css";

export default function NavbarAdmin() {
  const [open, setOpen] = useState(false);
  return (
    <nav>
      <div className="header">
        <NavLink to="/">
          <i className="fas fa-user-shield" /> Admin Registration
        </NavLink>
      </div>
      <ul
        className="navbar-links"
        style={{ transform: open ? "translateX(0px)" : "" }}
      >
        <li>
          <NavLink to="/AddCandidate" activeClassName="nav-active">
            ➕ Add Candidate
          </NavLink>
        </li>
        <li>
          <NavLink to="/Verification" activeClassName="nav-active">
            ☑️ Verification
          </NavLink>
        </li>
        {/* Vertical separator between admin and user functions */}
        <div className="navbar-separator"></div>
        <li>
          <NavLink to="/Registration" activeClassName="nav-active">
            👤 Registration
          </NavLink>
        </li>
        <li>
          <NavLink to="/Voting" activeClassName="nav-active">
            🗳️ Voting
          </NavLink>
        </li>
        <li>
          <NavLink to="/Results" activeClassName="nav-active">
            📈 Results
          </NavLink>
        </li>
      </ul>
      <i onClick={() => setOpen(!open)} className="fas fa-bars burger-menu"></i>
    </nav>
  );
}