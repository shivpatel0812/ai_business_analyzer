import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, applyActionCode } from "firebase/auth";

const ConfirmSignUp = ({ setIsAuthenticated }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || "";
  const auth = getAuth();

  const handleConfirmSignUp = async (event) => {
    event.preventDefault();
    try {
      console.log("Confirming sign up for username:", username);
      // Assuming you get the action code from the confirmation link
      await applyActionCode(auth, code);

      console.log("Sign up confirmed, signing in...");
      const user = auth.currentUser;
      if (user) {
        console.log("Sign in complete, setting isAuthenticated to true");
        setIsAuthenticated(true);
        navigate("/upload"); // Redirect to upload page after successful login
      } else {
        throw new Error("User not authenticated");
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
