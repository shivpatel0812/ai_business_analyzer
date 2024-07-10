import React, { useState } from "react";
import { Auth } from "aws-amplify";
import { useNavigate } from "react-router-dom";
import "../Login.css";

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    console.log("Attempting to log in...");
    try {
      const user = await Auth.signIn(username, password);
      console.log("Login successful:", user);
      // Assuming no MFA required
      console.log("Setting isAuthenticated to true");
      setIsAuthenticated(true);
      console.log("Navigating to upload page");
      navigate("/upload"); // Redirect to upload page after successful login
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Authentication Error");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
