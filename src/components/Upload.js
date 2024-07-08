import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Modal from "react-modal";
import { Auth } from "aws-amplify";
import "../styles.css";
import "./UploadStyles.css";
import AnalysisModal from "./AnalysisModal";
import { v4 as uuidv4 } from "uuid";

const Upload = ({ isOpen, onRequestClose, addImage }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState({});
  const [recentImage, setRecentImage] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  const fetchUserId = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      console.log("User authenticated:", user);
      return user.attributes.sub;
    } catch (error) {
      console.error("Error fetching user ID:", error.message);
      throw new Error("User not authenticated");
    }
  };

  const saveImageMetadata = async (userId, imageId, imageUrl, analysis) => {
    try {
      await axios.post(
        "https://996eyi0mva.execute-api.us-east-2.amazonaws.com/dev-stage/saveImageMetadata",
        {
          userId,
          imageId,
          imageUrl,
          analysis,
        }
      );
      console.log("Image metadata saved successfully");
    } catch (err) {
      console.error("Error saving image metadata:", err.message);
    }
  };

  const fetchAnalysis = async (data, imageUrl) => {
    setLoading(true);
    setError("");
    try {
      const userId = await fetchUserId();
      console.log("User ID fetched:", userId);

      const response = await axios.post(
        "https://8j01c6s5h4.execute-api.us-east-2.amazonaws.com/GPT-4VisionAnalysis",
        JSON.stringify(data),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Analysis response received:", response.data);

      const newImage = {
        url: imageUrl,
        analysis: response.data,
      };

      const imageId = uuidv4();
      setUploadedImage(newImage);
      setRecentImage(newImage);
      addImage(newImage);
      setAnalysisModalOpen(true);

      // Save image metadata after updating the state
      saveImageMetadata(userId, imageId, imageUrl, response.data);
    } catch (err) {
      console.error(
        "Error fetching analysis:",
        err.response ? err.response.data : err.message
      );
      setError("An error occurred while fetching the analysis.");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (!isAuthenticated) {
        setError("You must be authenticated to upload files.");
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result.split(",")[1];
          fetchAnalysis({ image_data: base64Image }, reader.result);
        };
        reader.readAsDataURL(file);
      }
    },
    [isAuthenticated]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <h2>Upload Page</h2>
      <p>This is the upload component.</p>
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag & drop some files here, or click to select files</p>
        )}
      </div>
      {recentImage && (
        <div className="recent-image">
          <h3>Most Recent Upload</h3>
          <img src={recentImage.url} alt="Recent Upload" />
        </div>
      )}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        className="modal"
        overlayClassName="modal-overlay"
        contentLabel="Upload Image"
      >
        <div>
          <h2>Image Analysis</h2>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? "active" : ""}`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <p>Drag & drop some files here, or click to select files</p>
            )}
          </div>
        </div>
      </Modal>
      <AnalysisModal
        isOpen={analysisModalOpen}
        onRequestClose={() => setAnalysisModalOpen(false)}
        image={uploadedImage}
      />
    </div>
  );
};

export default Upload;
