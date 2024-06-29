import React, { useState } from "react";
import axios from "axios";

const S3ImageDisplay = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [imageKey, setImageKey] = useState("");

  const fetchAnalysis = async (data, imageUrl) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "https://8j01c6s5h4.execute-api.us-east-2.amazonaws.com/GPT-4VisionAnalysis",
        JSON.stringify(data),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const newImage = {
        url: imageUrl,
        analysis: response.data.analysis,
      };
      setImages([newImage, ...images]);
    } catch (err) {
      setError("An error occurred while fetching the analysis.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result.split(",")[1];
        fetchAnalysis({ image_data: base64Image }, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleS3Fetch = () => {
    if (bucketName && imageKey) {
      fetchAnalysis({ bucket_name: bucketName, image_key: imageKey }, null);
    } else {
      setError("Please provide both S3 bucket name and image key.");
    }
  };

  return (
    <div>
      <h1>Image Analysis</h1>
      <div>
        <h3>Upload Image</h3>
        <input type="file" onChange={handleImageUpload} />
      </div>
      <div>
        <h3>Or Fetch from S3</h3>
        <input
          type="text"
          placeholder="Bucket Name"
          value={bucketName}
          onChange={(e) => setBucketName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Image Key"
          value={imageKey}
          onChange={(e) => setImageKey(e.target.value)}
        />
        <button onClick={handleS3Fetch}>Fetch Image from S3</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        {images.map((image, index) => (
          <div key={index} style={{ marginBottom: "20px" }}>
            {image.url && (
              <img
                src={image.url}
                alt="Uploaded"
                style={{ maxWidth: "100%" }}
              />
            )}
            <h3>Analysis Result:</h3>
            <pre>{image.analysis}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default S3ImageDisplay;
