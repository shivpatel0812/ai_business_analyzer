import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import "../Organization.css";

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const navigate = useNavigate();
  const firestore = getFirestore();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(firestore, "Organizations")
        );
        const orgs = querySnapshot.docs.map((doc) => doc.data());
        setOrganizations(orgs);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, [firestore]);

  const createOrganization = async () => {
    if (!newOrganizationName.trim()) {
      console.error("Organization name cannot be empty.");
      return;
    }

    try {
      await addDoc(collection(firestore, "Organizations"), {
        name: newOrganizationName.trim(),
        members: [],
      });

      console.log(
        "Organization created with name: ",
        newOrganizationName.trim()
      );
      setNewOrganizationName("");
      setIsModalOpen(false);

      // Fetch the updated list of organizations
      const querySnapshot = await getDocs(
        collection(firestore, "Organizations")
      );
      const orgs = querySnapshot.docs.map((doc) => doc.data());
      setOrganizations(orgs);
    } catch (error) {
      console.error("Error creating organization:", error);
    }
  };

  const navigateToOrganization = (orgName) => {
    console.log("Navigating to organization with name:", orgName);
    navigate(`/organizations/${encodeURIComponent(orgName)}`);
  };

  return (
    <div className="organizations-container">
      <h1>Organizations</h1>
      <button onClick={() => setIsModalOpen(true)}>Create Organization</button>
      <div className="organization-cards">
        {organizations.length > 0 ? (
          organizations.map((org, index) => (
            <div
              key={index}
              className="organization-card"
              onClick={() => navigateToOrganization(org.name)}
            >
              <h3>{org.name || "Unnamed Organization"}</h3>
            </div>
          ))
        ) : (
          <p>No organizations available</p>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Create Organization</h2>
        <input
          type="text"
          value={newOrganizationName}
          onChange={(e) => setNewOrganizationName(e.target.value)}
          placeholder="Organization Name"
        />
        <button onClick={createOrganization}>Create</button>
      </Modal>
    </div>
  );
};

export default Organizations;
