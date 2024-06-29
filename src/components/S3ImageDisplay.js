import React from "react";
import "../styles.css";

const S3ImageDisplay = ({ images, openImageModal }) => {
  console.log("S3ImageDisplay component rendered with images:", images);

  return (
    <div>
      <div className="card-container">
        {images.map((image, index) => (
          <div
            key={index}
            className="card"
            onClick={() => openImageModal(image)}
          >
            {image.url && (
              <img src={image.url} alt="Uploaded" className="card-image" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default S3ImageDisplay;
