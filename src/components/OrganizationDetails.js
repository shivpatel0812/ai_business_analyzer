import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import "../OrganizationDetails.css";
import AnalysisModal from "./AnalysisModal"; // Import AnalysisModal
import InviteModal from "./InviteModal";

const OrganizationDetails = () => {
  const { orgName } = useParams();
  const [organization, setOrganization] = useState(null);
  const [sharedCards, setSharedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false); // Toggle for member list
  const [error, setError] = useState(null);
  const firestore = getFirestore();

  useEffect(() => {
    if (!orgName) {
      setError("No organization name provided.");
      return;
    }

    const fetchOrganizationDetails = async () => {
      try {
        const orgQuery = query(
          collection(firestore, "Organizations"),
          where("name", "==", orgName)
        );
        const orgQuerySnapshot = await getDocs(orgQuery);

        if (!orgQuerySnapshot.empty) {
          const orgDoc = orgQuerySnapshot.docs[0];
          const orgData = orgDoc.data();
          setOrganization(orgData);

          const sharedCardsQuery = query(
            collection(firestore, "OrganizationSharedCards"),
            where("organizationId", "==", orgDoc.id)
          );
          const sharedCardsSnapshot = await getDocs(sharedCardsQuery);

          if (!sharedCardsSnapshot.empty) {
            const cards = sharedCardsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setSharedCards(cards);
          } else {
            setError("No shared cards found.");
          }
        } else {
          setError("No such organization document!");
        }
      } catch (error) {
        setError("Error fetching organization details.");
      }
    };

    fetchOrganizationDetails();
  }, [firestore, orgName]);

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  const handleInviteClick = () => {
    setIsInviteModalOpen(true);
  };

  if (error) return <div>Error: {error}</div>;
  if (!organization) return <div>Loading...</div>;

  return (
    <div className="organization-details-container">
      <div className="sidebar">
        <button onClick={handleInviteClick} className="invite-button">
          Invite Members
        </button>
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="members-toggle-button"
        >
          Members
        </button>
        {showMembers && (
          <ul className="members-list">
            {Array.isArray(organization?.members) ? (
              organization.members.map((member, index) => (
                <li key={index}>{member}</li>
              ))
            ) : (
              <li>No members available</li>
            )}
          </ul>
        )}
      </div>

      <div className="content">
        <h1>{organization?.name || "No Name Available"}</h1>
        <h2>Shared Cards:</h2>
        <div className="card-container">
          {sharedCards.length > 0 ? (
            sharedCards.map((card) => (
              <div
                key={card.id}
                className="card"
                onClick={() => handleCardClick(card)}
              >
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
                      <strong>Address:</strong> {card.contact?.Address}
                      <br />
                      <strong>Phone:</strong> {card.contact?.Phone}
                      <br />
                      <strong>LinkedIn:</strong>
                      <a
                        href={card.contact?.LinkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {card.contact?.LinkedIn}
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

      {selectedCard && (
        <AnalysisModal
          isOpen={isCardModalOpen}
          onRequestClose={() => setIsCardModalOpen(false)}
          image={selectedCard}
          friends={[]}
        />
      )}

      <InviteModal
        isOpen={isInviteModalOpen}
        onRequestClose={() => setIsInviteModalOpen(false)}
        organizationName={organization?.name}
      />
    </div>
  );
};

export default OrganizationDetails;
