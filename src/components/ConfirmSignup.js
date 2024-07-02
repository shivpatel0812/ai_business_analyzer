import React, { useState } from "react";
import { Auth } from "aws-amplify";
import { useLocation, useNavigate } from "react-router-dom";

const ConfirmSignUp = ({ setIsAuthenticated }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || "";

  const handleConfirmSignUp = async (event) => {
    event.preventDefault();
    try {
      console.log("Confirming sign up for username:", username);
      await Auth.confirmSignUp(username, code);

      console.log("Sign up confirmed, signing in...");
      const user = await Auth.signIn(username);
      if (
        user.challengeName === "SMS_MFA" ||
        user.challengeName === "SOFTWARE_TOKEN_MFA"
      ) {
        console.log("Additional MFA required");
        // Handle additional MFA if necessary
      } else {
        console.log("Sign in complete, setting isAuthenticated to true");
        setIsAuthenticated(true);
        navigate("/upload"); // Redirect to upload page after successful login
      }
    } catch (err) {
      console.error("Error confirming sign up:", err);
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Confirm Sign Up</h2>
      <form onSubmit={handleConfirmSignUp}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Confirmation Code"
          required
        />
        <button type="submit">Confirm Sign Up</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default ConfirmSignUp;
