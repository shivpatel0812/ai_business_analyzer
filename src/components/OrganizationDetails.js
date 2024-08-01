import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import "../OrganizationDetails.css"; // Import the CSS file

const OrganizationDetails = () => {
  const { orgName } = useParams();
  const [organization, setOrganization] = useState(null);
  const [error, setError] = useState(null);
  const [sharedCards, setSharedCards] = useState([]);
  const firestore = getFirestore();

  useEffect(() => {
    console.log("useEffect triggered. orgName:", orgName);

    if (!orgName) {
      console.error("No organization name provided in useParams.");
      setError("No organization name provided.");
      return;
    }

    const fetchOrganizationDetails = async () => {
      try {
        console.log(`Fetching details for organization name: ${orgName}`);
        const orgQuery = query(
          collection(firestore, "Organizations"),
          where("name", "==", orgName)
        );
        const orgQuerySnapshot = await getDocs(orgQuery);

        if (!orgQuerySnapshot.empty) {
          const orgData = orgQuerySnapshot.docs[0].data();
          console.log("Organization Data:", orgData);
          setOrganization(orgData);
        } else {
          console.error("No such organization document!");
          setError("No such organization document!");
          return;
        }

        console.log(`Querying shared cards for organizationId: ${orgName}`);
        const sharedCardsQuery = query(
          collection(firestore, "OrganizationSharedCards"),
          where("organizationId", "==", orgName)
        );
        const sharedCardsSnapshot = await getDocs(sharedCardsQuery);

        console.log("sharedCardsSnapshot:", sharedCardsSnapshot);
        if (!sharedCardsSnapshot.empty) {
          const cards = sharedCardsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Shared Cards Data:", cards);
          setSharedCards(cards);
        } else {
          console.error("No shared cards found for this organization.");
          setError("No shared cards found.");
        }
      } catch (error) {
        console.error("Error fetching organization details:", error);
        setError("Error fetching organization details.");
      }
    };

    fetchOrganizationDetails();
  }, [firestore, orgName]);

  if (error) return <div>Error: {error}</div>;
  if (!organization) return <div>Loading...</div>;

  return (
    <div>
      <h1>{organization?.name || "No Name Available"}</h1>
      <h2>Members:</h2>
      <ul>
        {Array.isArray(organization?.members) ? (
          organization.members.map((member, index) => (
            <li key={index}>{member}</li>
          ))
        ) : (
          <li>No members available</li>
        )}
      </ul>
      <h2>Shared Cards:</h2>
      <div className="card-container">
        {sharedCards.length > 0 ? (
          sharedCards.map((card) => (
            <div key={card.id} className="card">
              <img
                src={card.imageUrl}
                alt="Shared Card"
                className="card-image"
              />
              <div className="analysis">
                {card.analysis && (
                  <div>
                    <strong>Company:</strong> {card.analysis.company}
                    <br />
                    <strong>Address:</strong> {card.contact.Address}
                    <br />
                    <strong>Phone:</strong> {card.contact.Phone}
                    <br />
                    <strong>LinkedIn:</strong>
                    <a
                      href={card.contact.LinkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {card.contact.LinkedIn}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No shared cards available</p>
        )}
      </div>
    </div>
  );
};

export default OrganizationDetails;