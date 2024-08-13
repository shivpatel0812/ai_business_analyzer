import React from "react";
import "../styles.css";

const S3ImageDisplay = ({ images, openImageModal }) => {
  console.log("S3ImageDisplay component rendered with images:", images);

  const validImages = Array.isArray(images) ? images : [];

  return (
    <div>
      <div className="card-container">
        {validImages.length > 0 ? (
          validImages.map((image, index) => (
            <div
              key={index}
              className="card"
              onClick={() => openImageModal(image)}
            >
              {image.imageUrl && (
                <img
                  src={
                    typeof image.imageUrl === "string"
                      ? image.imageUrl
                      : image.imageUrl.S
                  }
                  alt="Uploaded"
                  className="card-image"
                />
              )}
            </div>
          ))
        ) : (
          <p>No images to display</p>
        )}
      </div>
    </div>
  );
};

export default S3ImageDisplay;
