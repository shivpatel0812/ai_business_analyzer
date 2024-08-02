import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "../Organization.css";

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const firestore = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!auth.currentUser) return;

      try {
        const orgQuerySnapshot = await getDocs(
          collection(firestore, "Organizations")
        );
        const userOrganizations = orgQuerySnapshot.docs.filter((doc) => {
          const data = doc.data();
          return data.members && data.members.includes(auth.currentUser.email);
        });

        const userOrgData = userOrganizations.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrganizations(userOrgData);
        console.log("Fetched organizations:", userOrgData);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        setError("Error fetching organizations.");
      }
    };

    fetchOrganizations();
  }, [firestore, auth.currentUser]);

  const handleOrganizationClick = (orgName) => {
    console.log("Navigating to organization with name:", orgName);
    navigate(`/organizations/${orgName}`);
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="organizations-container">
      <h1>Organizations</h1>
      <button onClick={() => navigate("/create-organization")}>
        Create Organization
      </button>
      <div className="organization-cards">
        {organizations.length > 0 ? (
          organizations.map((org) => (
            <div
              key={org.id}
              className="organization-card"
              onClick={() => handleOrganizationClick(org.name)}
            >
              <h2>{org.name}</h2>
            </div>
          ))
        ) : (
          <p>You are not a member of any organizations.</p>
        )}
      </div>
    </div>
  );
};

export default Organizations;
