import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../SharedCards.css";

const SharedCards = ({ sharedCards }) => {
  const [view, setView] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

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
