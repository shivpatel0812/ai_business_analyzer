import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Modal from "react-modal";
import "../SharedCards.css";
import CardDetailsModal from "./CardDetailsModal";

const SharedCards = () => {
  const [view, setView] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [sharedCards, setSharedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const firestore = getFirestore();

  useEffect(() => {
    const fetchSharedCards = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(firestore, "SharedCards")
        );
        const cards = querySnapshot.docs.map((doc) => doc.data());
        setSharedCards(cards);
      } catch (error) {
        console.error("Error fetching shared cards:", error);
      }
    };
    fetchSharedCards();
  }, [firestore]);

  const openModal = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const filteredCards =
    view === "user" && selectedUser
      ? sharedCards.filter((card) => card.sharedBy === selectedUser)
      : sharedCards;

  return (
    <div className="shared-cards-container">
      <h1>Shared Cards</h1>
      <div>
        <button onClick={() => setView("all")}>All Cards</button>
        <button onClick={() => setView("user")}>By User</button>
      </div>
      {view === "user" && (
        <div>
          <h2>Select User</h2>
          <select
            value={selectedUser || ""}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="" disabled>
              Select a user
            </option>
            {Array.from(new Set(sharedCards.map((card) => card.sharedBy))).map(
              (user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              )
            )}
          </select>
        </div>
      )}
      <div className="cards-list">
        {filteredCards.map((card, index) => (
          <div
            key={index}
            className="card-item"
            onClick={() => openModal(card)}
          >
            <img src={card.imageUrl} alt="Shared Card" />
            <p>{card.analysis?.summary.split(" ").slice(0, 10).join(" ")}...</p>
          </div>
        ))}
      </div>
      <CardDetailsModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        card={selectedCard}
      />
    </div>
  );
};

export default SharedCards;
