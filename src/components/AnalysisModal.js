import React, { useState } from "react";
import Modal from "react-modal";
import "../styles.css";

const AnalysisModal = ({ isOpen, onRequestClose, image = {} }) => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);

  const renderContactInfo = (contact = {}) => {
    return (
      <div>
        {contact.Name && (
          <div>
            <strong>Name:</strong> {contact.Name}
          </div>
        )}
        {contact.Company && (
          <div>
            <strong>Company:</strong> {contact.Company}
          </div>
        )}
        {contact.Address && (
          <div>
            <strong>Address:</strong> {contact.Address}
          </div>
        )}
        {contact.Phone && (
          <div>
            <strong>Phone:</strong> {contact.Phone}
          </div>
        )}
        {contact.LinkedIn && (
          <div>
            <strong>LinkedIn:</strong>{" "}
            <a
              href={contact.LinkedIn}
              target="_blank"
              rel="noopener noreferrer"
            >
              {contact.LinkedIn}
            </a>
          </div>
        )}
        {contact.Email && (
          <div>
            <strong>Email:</strong> {contact.Email}
          </div>
        )}
      </div>
    );
  };

  const renderNewsArticles = (news = []) => {
    if (!news || news.length === 0) {
      return <div>No news articles found.</div>;
    }

    return (
      <div>
        {news.map((article, index) => (
          <div key={index}>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
          </div>
        ))}
      </div>
    );
  };

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
        {image.url && (
          <img src={image.url} alt="Uploaded" className="modal-image" />
        )}
        <h3>Analysis Result:</h3>
        <div className="report-section">
          <h4 onClick={() => setContactModalOpen(true)}>Contact Information</h4>
          {renderContactInfo(image.analysis?.contact)}
        </div>
        <div className="report-section">
          <h4 onClick={() => setCompanyModalOpen(true)}>Company Information</h4>
          <pre>{image.analysis?.company}</pre>
        </div>
        <div className="report-section">
          <h4>Summary</h4>
          <pre>{image.analysis?.summary}</pre>
        </div>
        <div className="report-section">
          <h4 onClick={() => setNewsModalOpen(true)}>News</h4>
          {renderNewsArticles(image.analysis?.news)}
        </div>
        <div className="report-section">
          <h4 onClick={() => setInterviewModalOpen(true)}>
            Interview Questions
          </h4>
          <pre>
            {JSON.stringify(image.analysis?.interview_questions, null, 2)}
          </pre>
        </div>
      </div>

      <Modal
        isOpen={contactModalOpen}
        onRequestClose={() => setContactModalOpen(false)}
        className="popup-modal"
        overlayClassName="modal-overlay"
      >
        <div className="popup-content">
          <button
            onClick={() => setContactModalOpen(false)}
            className="modal-close"
          >
            &times;
          </button>
          <h4>Contact Information</h4>
          {renderContactInfo(image.analysis?.contact)}
        </div>
      </Modal>

      <Modal
        isOpen={companyModalOpen}
        onRequestClose={() => setCompanyModalOpen(false)}
        className="popup-modal"
        overlayClassName="modal-overlay"
      >
        <div className="popup-content">
          <button
            onClick={() => setCompanyModalOpen(false)}
            className="modal-close"
          >
            &times;
          </button>
          <h4>Company Information</h4>
          <pre>{image.analysis?.company}</pre>
        </div>
      </Modal>

      <Modal
        isOpen={newsModalOpen}
        onRequestClose={() => setNewsModalOpen(false)}
        className="popup-modal"
        overlayClassName="modal-overlay"
      >
        <div className="popup-content">
          <button
            onClick={() => setNewsModalOpen(false)}
            className="modal-close"
          >
            &times;
          </button>
          <h4>News</h4>
          {renderNewsArticles(image.analysis?.news)}
        </div>
      </Modal>

      <Modal
        isOpen={interviewModalOpen}
        onRequestClose={() => setInterviewModalOpen(false)}
        className="popup-modal"
        overlayClassName="modal-overlay"
      >
        <div className="popup-content">
          <button
            onClick={() => setInterviewModalOpen(false)}
            className="modal-close"
          >
            &times;
          </button>
          <h4>Interview Questions</h4>
          <pre>
            {JSON.stringify(image.analysis?.interview_questions, null, 2)}
          </pre>
        </div>
      </Modal>
    </Modal>
  );
};

export default AnalysisModal;
