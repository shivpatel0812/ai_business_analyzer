import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Modal from "react-modal";
import { Storage } from "@aws-amplify";
import "../styles.css";
import "./UploadStyles.css";
import AnalysisModal from "./AnalysisModal";
import { v4 as uuidv4 } from "uuid";
import configureAwsWithFirebaseToken from "../configureAws";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Upload = ({ isOpen, onRequestClose, addImage, fetchUserImages }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState({});
  const [recentImage, setRecentImage] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    configureAwsWithFirebaseToken();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
  }, [auth]);

  const fetchUserId = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        return user.uid;
      } else {
        throw new Error("User not authenticated");
      }
    } catch (error) {
      console.error("Error fetching user ID:", error.message);
      throw new Error("User not authenticated");
    }
  };

  const saveImageMetadata = async (userId, imageId, imageUrl, analysis) => {
    if (!userId || !imageId || !imageUrl || !analysis) {
      console.error("Missing required parameters for saving image metadata");
      return;
    }

    try {
      const payload = { userId, imageId, imageUrl, analysis };
      await axios.post(
        "https://996eyi0mva.execute-api.us-east-2.amazonaws.com/dev-stage/saveImageMetadata",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Image metadata saved successfully");
    } catch (err) {
      console.error("Error saving image metadata:", err.message);
      throw err;
    }
  };

  const fetchAnalysis = async (data, imageUrl) => {
    setLoading(true);
    setError("");
    try {
      const userId = await fetchUserId();
      const response = await axios.post(
        "https://8j01c6s5h4.execute-api.us-east-2.amazonaws.com/GPT-4VisionAnalysis",
        JSON.stringify({ ...data, userId }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const newImage = {
        url: imageUrl,
        analysis: response.data,
      };

      const imageId = uuidv4();
      setUploadedImage(newImage);
      setRecentImage(newImage);
      addImage(newImage);
      setAnalysisModalOpen(true);

      await saveImageMetadata(userId, imageId, imageUrl, response.data);
      await fetchUserImages(userId);
    } catch (err) {
      console.error("Error fetching analysis:", err.message);
      setError("An error occurred while fetching the analysis.");
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToS3 = async (file) => {
    if (!file || !(file instanceof File)) {
      throw new Error("Invalid file object");
    }

    const fileName = `${uuidv4()}_${file.name}`;
    try {
      const result = await Storage.put(fileName, file, {
        contentType: file.type,
        level: "public",
      });
      console.log("Upload successful:", result);
      return result.key;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw error;
    }
  };

  const getS3Url = async (key) => {
    try {
      return await Storage.get(key, { level: "public" });
    } catch (error) {
      console.error("Error getting S3 URL:", error);
      throw error;
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (!isAuthenticated) {
        setError("You must be authenticated to upload files.");
        return;
      }

      const file = acceptedFiles[0];
      if (!file) {
        setError("No file selected. Please choose a file to upload.");
        return;
      }

      console.log(
        "File selected:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type
      );

      try {
        const fileKey = await uploadImageToS3(file);
        console.log("File uploaded successfully, key:", fileKey);

        const imageUrl = await getS3Url(fileKey);
        console.log("Image URL:", imageUrl);

        // Use FileReader to get base64 data
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Image = e.target.result.split(",")[1];
          await fetchAnalysis({ image_data: base64Image }, imageUrl);
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
          setError("Error reading the file. Please try again.");
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error processing file:", error);
        setError(
          `An error occurred while processing the file: ${error.message}`
        );
      }
    },
    [isAuthenticated, uploadImageToS3, fetchAnalysis]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <h2>Upload Business Card</h2>
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the business card image here...</p>
        ) : (
          <p>
            Drag & drop a business card image here, or click to select a file
          </p>
        )}
      </div>
      {recentImage && (
        <div className="recent-image">
          <h3>Most Recent Upload</h3>
          <img
            src={recentImage.url}
            alt="Recent Upload"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      )}
      {loading && <p>Analyzing business card...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        className="modal"
        overlayClassName="modal-overlay"
        contentLabel="Upload Image"
      >
        <div>
          <h2>Upload Business Card</h2>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? "active" : ""}`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the business card image here...</p>
            ) : (
              <p>
                Drag & drop a business card image here, or click to select a
                file
              </p>
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
