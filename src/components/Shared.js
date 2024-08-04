import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../datatable.css";

const Shared = ({ images = [], setSelectedImage }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewCard = (image) => {
    setSelectedImage(image);
    navigate("/");
  };

  const filteredImages = images.filter((image) => {
    const contact = image.analysis.contact || {};
    const company = image.analysis.company || "";
    return (
      (contact.Name &&
        contact.Name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.Company &&
        contact.Company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.Phone &&
        contact.Phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.Email &&
        contact.Email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.LinkedIn &&
        contact.LinkedIn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company && company.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="uploaded-cards-page">
      <h1>Uploaded Cards</h1>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />
      <table className="cards-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Phone</th>
            <th>Email</th>
            <th>LinkedIn</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredImages.map((image, index) => {
            const contact = image.analysis.contact || {};
            return (
              <tr key={index} className="card-row">
                <td className="card-cell">{contact.Name || "N/A"}</td>
                <td className="card-cell">{contact.Company || "N/A"}</td>
                <td className="card-cell">{contact.Phone || "N/A"}</td>
                <td className="card-cell">{contact.Email || "N/A"}</td>
                <td className="card-cell">
                  <a
                    href={contact.LinkedIn || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linkedin-link"
                  >
                    {contact.LinkedIn || "N/A"}
                  </a>
                </td>
                <td className="card-cell">
                  <button
                    onClick={() => handleViewCard(image)}
                    className="view-card-button"
                  >
                    View Card
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Link to="/" className="back-to-home">
        Back to Home
      </Link>
    </div>
  );
};

export default Shared;
