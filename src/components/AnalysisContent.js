import React from "react";
import CollapsibleSection from "./CollapsibleSection"; // Import the CollapsibleSection component
import "../styles.css";
import "../analysisstyle.css";

const AnalysisContent = ({ image }) => {
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

    return <pre className="summary-section">{filteredSummary}</pre>;
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
    <>
      <h3>Analysis Result:</h3>
      <CollapsibleSection title="Contact Information">
        {renderContactInfo(image.analysis?.contact)}
      </CollapsibleSection>
      <CollapsibleSection title="Company Information">
        {renderCompanyInfo(image.analysis?.company)}
      </CollapsibleSection>
      <CollapsibleSection title="Summary">
        <div className="summary-section">
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
    </>
  );
};

export default AnalysisContent;
