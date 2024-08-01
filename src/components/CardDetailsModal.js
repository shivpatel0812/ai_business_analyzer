import React from "react";
import Modal from "react-modal";

const CardDetailsModal = ({ isOpen, onRequestClose, card }) => {
  if (!card) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="modal-content">
        <button onClick={onRequestClose} className="modal-close">
          &times;
        </button>
        <h2>Card Details</h2>
        <div className="card-details">
          <img src={card.imageUrl} alt="Card" />
          <div className="card-info">
            <h3>Contact Information</h3>
            <p>
              <strong>Address:</strong> {card.analysis?.contact?.Address}
            </p>
            <p>
              <strong>Phone:</strong> {card.analysis?.contact?.Phone}
            </p>
            <p>
              <strong>LinkedIn:</strong>
              <a
                href={card.analysis?.contact?.LinkedIn}
                target="_blank"
                rel="noopener noreferrer"
              >
                {card.analysis?.contact?.LinkedIn}
              </a>
            </p>
            <h3>Company Information</h3>
            <p>{card.analysis?.company}</p>
            <h3>Summary</h3>
            <p>{card.analysis?.summary}</p>
            {card.analysis?.news && (
              <>
                <h3>News</h3>
                <ul>
                  {card.analysis.news.map((newsItem, index) => (
                    <li key={index}>
                      <a
                        href={newsItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {newsItem.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {card.analysis?.interview_questions && (
              <>
                <h3>Interview Questions</h3>
                <ul>
                  {card.analysis.interview_questions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CardDetailsModal;
