import React from "react";
import { Link } from "react-router-dom";
import "./UploadedCards.css";

const UploadedCards = ({ cards }) => {
  return (
    <div className="uploaded-cards-container">
      <h1>Uploaded Cards</h1>
      <ul className="uploaded-cards-list">
        {cards.map((card, index) => (
          <li key={index} className="uploaded-card-item">
            <div>Name: {card.analysis.contact.Name}</div>
            <div>Company: {card.analysis.contact.Company}</div>
            <div>Phone: {card.analysis.contact.Phone}</div>
            <div>
              LinkedIn:{" "}
              <a
                href={card.analysis.contact.LinkedIn}
                target="_blank"
                rel="noopener noreferrer"
              >
                {card.analysis.contact.LinkedIn}
              </a>
            </div>
          </li>
        ))}
      </ul>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

export default UploadedCards;
