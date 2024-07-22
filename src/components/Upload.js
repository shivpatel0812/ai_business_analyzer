import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Modal from "react-modal";
import { Auth, Storage } from "aws-amplify";
import "../styles.css";
import "./UploadStyles.css";
import AnalysisModal from "./AnalysisModal";
import { v4 as uuidv4 } from "uuid";
import awsExports from "../aws-exports";

import AWS from 'aws-sdk';
import awsconfig from '../aws-exports'; 


//----------------------------------------------
  // Configure the AWS SDK
  AWS.config.update({
    region: awsconfig.aws_user_files_s3_bucket_region,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: awsconfig.aws_cognito_identity_pool_id,
    }),
  });
  
  //----------------------------------------------


const Upload = ({ isOpen, onRequestClose, addImage, fetchUserImages }) => {
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
    if (!awsconfig || !awsconfig.aws_user_files_s3_bucket) {
      console.error('awsconfig or aws_user_files_s3_bucket is not defined');
      return;
    }

    if (!userId || !imageId || !imageUrl || !analysis) {
      console.error("Missing required parameters:", {
        userId,
        imageId,
        imageUrl,
        analysis,
      });
      return;
    }

    try {
      const payload = {
        userId,
        imageId,
        imageUrl,
        analysis,
      };
      console.log("Saving image metadata with payload:", payload);
      await axios.post(
        "https://996eyi0mva.execute-api.us-east-2.amazonaws.com/dev-stage/saveImageMetadata",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
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
      console.log("User ID fetched:", userId);

      const response = await axios.post(
        "https://8j01c6s5h4.execute-api.us-east-2.amazonaws.com/GPT-4VisionAnalysis",
        JSON.stringify({ ...data, userId }),
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

      await saveImageMetadata(userId, imageId, imageUrl, response.data);
      await fetchUserImages(userId);
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



  // const uploadImageToS3 = async (file) => {
  //   const fileName = `${uuidv4()}_${file.name}`;
  //   try {
  //     const result = await Storage.put(fileName, file, {
  //       contentType: file.type,
  //       level: 'public',
  //     });
  //     return result.key; // S3 key of the uploaded image
  //   } catch (error) {
  //     console.error("Error uploading file to S3:", error);
  //     throw error;
  //   }
  // };

  console.log(awsconfig);

  const uploadImageToS3 = async (file) => {
    const fileName = `${uuidv4()}_${file.name}`;
  
    // Create a new S3 client
    const s3 = new AWS.S3();
  
    // Ensure awsconfig.aws_user_files_s3_bucket is defined
    if (!awsconfig.aws_user_files_s3_bucket) {
      console.error("Bucket name is undefined");
      return;
    }
  
    // Set up the parameters for the S3 upload operation
    const params = {
      Bucket: awsconfig.aws_user_files_s3_bucket,
      Key: `public/${fileName}`,
      Body: file,
      ContentType: file.type,
    };
  
    // Use the S3 client to upload the file
    try {
      const result = await s3.upload(params).promise();
      return result.Key; // S3 key of the uploaded image
    } catch (error) {
      console.error("Error uploading file to S3:", error);
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
      if (file) {
        const fileKey = await uploadImageToS3(file);
        const imageUrl = `https://${awsExports.aws_user_files_s3_bucket}.s3.${awsExports.aws_user_files_s3_bucket_region}.amazonaws.com/public/${fileKey}`;

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result.split(",")[1];
          fetchAnalysis({ image_data: base64Image }, imageUrl);
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