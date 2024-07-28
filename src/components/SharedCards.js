import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import "../SharedCards.css";

const SharedCards = ({ userId }) => {
  const [view, setView] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [sharedCards, setSharedCards] = useState([]);
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
  }, []);

  const users = [...new Set(sharedCards.map((card) => card.sharedBy))];

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
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            {users.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="cards-list">
        {filteredCards.map((card, index) => (
          <div key={index} className="card-item">
            <img src={card.url} alt="Shared Card" />
            <p>{card.analysis.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedCards;
