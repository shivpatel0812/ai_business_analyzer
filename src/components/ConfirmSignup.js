import React, { useState } from "react";
import { Auth } from "aws-amplify";
import { useLocation, useNavigate } from "react-router-dom";

const ConfirmSignUp = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || "";

  const handleConfirmSignUp = async (event) => {
    event.preventDefault();
    try {
      await Auth.confirmSignUp(username, code);
      alert("Sign up confirmed!");
      navigate("/login");
    } catch (err) {
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
