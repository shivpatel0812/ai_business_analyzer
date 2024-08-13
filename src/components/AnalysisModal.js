import React, { useState } from "react";
import Modal from "react-modal";
import ShareModal from "./ShareModal"; // Import ShareModal
import "../styles.css";
import "../analysisstyle.css";

const CollapsibleSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="collapsible-section">
      <h4 onClick={() => setIsOpen(!isOpen)} className="collapsible-title">
        {title}
      </h4>
      {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  );
};

const AnalysisModal = ({ isOpen, onRequestClose, image = {}, friends }) => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false); // State for ShareModal

  const renderContactInfo = (contact = {}) => {
    return (
      <div className="contact-info-box">
        {contact.Name && (
          <div className="contact-info-item">
            <strong>Name:</strong> {contact.Name}
          </div>
        )}
        {contact.Role && (
          <div className="contact-info-item">
            <strong>Role:</strong> {contact.Role}
          </div>
        )}
        {contact.Company && (
          <div className="contact-info-item">
            <strong>Company:</strong> {contact.Company}
          </div>
        )}
        {contact.Address && (
          <div className="contact-info-item">
            <strong>Address:</strong> {contact.Address}
          </div>
        )}
        {contact.Phone && (
          <div className="contact-info-item">
            <strong>Phone:</strong> {contact.Phone}
          </div>
        )}
        {contact.Email && (
          <div className="contact-info-item">
            <strong>Email:</strong>{" "}
            <a href={`mailto:${contact.Email}`}>{contact.Email}</a>
          </div>
        )}
        {contact.LinkedIn && (
          <div className="contact-info-item">
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
      </div>
    );
  };

  const renderCompanyInfo = (company) => {
    if (!company || company === "No company name provided") {
      return <div>No company name provided</div>;
    }
    return <div>{company}</div>;
  };

  const renderSummary = (summary = "") => {
    const indexOfContactInfoSummary = summary.indexOf(
      "Contact Information Summary:"
    );

    const filteredSummary =
      indexOfContactInfoSummary !== -1
        ? summary.slice(0, indexOfContactInfoSummary).trim()
        : summary;

    return (
      <pre className="summary-section">
        {" "}
        {/* Add the custom class here */}
        {filteredSummary}
      </pre>
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
      style={{
        content: {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70vw",
          maxWidth: "1000px",
        },
      }}
    >
      <div className="modal-content">
        <button onClick={onRequestClose} className="modal-close">
          &times;
        </button>
        {image.url && (
          <img src={image.url} alt="Uploaded" className="modal-image" />
        )}
        <h3>Analysis Result:</h3>
        <CollapsibleSection title="Contact Information">
          {renderContactInfo(image.analysis?.contact)}
        </CollapsibleSection>
        <CollapsibleSection title="Company Information">
          {renderCompanyInfo(image.analysis?.company)}
        </CollapsibleSection>
        <CollapsibleSection title="Summary">
          <div className="summary-section">
            {" "}
            {/* Wrap in div for custom class */}
            {renderSummary(image.analysis?.summary)}
          </div>
        </CollapsibleSection>
        <CollapsibleSection title="News">
          {renderNewsArticles(image.analysis?.news)}
        </CollapsibleSection>
        <CollapsibleSection title="Interview Questions">
          <pre>
            {JSON.stringify(image.analysis?.interview_questions, null, 2)}
          </pre>
        </CollapsibleSection>
        <button
          onClick={() => setShareModalOpen(true)}
          className="upload-button"
        >
          Share
        </button>
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
          {renderCompanyInfo(image.analysis?.company)}
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

      <ShareModal
        isOpen={isShareModalOpen}
        onRequestClose={() => setShareModalOpen(false)}
        image={image}
        friends={friends}
      />
    </Modal>
  );
};

export default AnalysisModal;
