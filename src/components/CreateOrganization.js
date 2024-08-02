import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import "../CreateOrganization.css"; // Add appropriate styling

const CreateOrganization = () => {
  const [orgName, setOrgName] = useState("");
  const [message, setMessage] = useState("");
  const firestore = getFirestore();
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      if (!orgName) {
        setMessage("Organization name cannot be empty.");
        return;
      }

      console.log("Creating organization with name:", orgName);
      await addDoc(collection(firestore, "Organizations"), {
        name: orgName, // Store the exact name provided
        members: [auth.currentUser.email],
      });
      setMessage("Organization created successfully!");
      navigate("/organizations");
    } catch (error) {
      console.error("Error creating organization:", error);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Create a New Organization</h2>
      <input
        type="text"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
        placeholder="Enter organization name"
      />
      <button onClick={handleCreate}>Create Organization</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateOrganization;
