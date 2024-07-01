import React from "react";
import { Link } from "react-router-dom";
import "./Home.css"; // Ensure Home.css is correctly imported

const Home = () => {
  return (
    <div className="home-page">
      <div className="content-container">
        <h1>Welcome to AI Business Card Analyzer</h1>
        <p>
          This application allows you to upload business cards and analyze them
          using AI. You can get detailed information about the person and the
          company from the card.
        </p>
        <div className="auth-options">
          <Link to="/login" className="auth-button login-button">
            Login
          </Link>
          <Link to="/register" className="auth-button register-button">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
