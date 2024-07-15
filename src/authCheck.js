const Amplify = require("aws-amplify").default;
const Auth = require("aws-amplify").Auth;
const axios = require("axios");
const awsconfig = require("./aws-exports.js");
const fs = require("fs");
const path = require("path");
const { Storage } = require("aws-amplify");
const { v4: uuidv4 } = require("uuid");

// Configure Amplify with the AWS settings
Amplify.configure(awsconfig);

async function signIn(username, password) {
  try {
    const user = await Auth.signIn(username, password);
    console.log("Authenticated user:", user);

    // Fetch user ID and test the API
    const userId = await fetchUserId();
    await testApi(userId);

    // Upload an image, get its analysis, and save its metadata
    const imagePath = path.join(__dirname, "BusinessCard3 (1).jpg"); // Path to the image file
    const imageId = uuidv4(); // Generate a unique image ID

    const analysis = await getImageAnalysis(imagePath, userId);
    if (analysis) {
      const imageUrl = await uploadImageToS3(imagePath); // Upload the image to S3 and get its URL
      if (imageUrl) {
        await saveImageMetadata(userId, imageId, imageUrl, analysis);
        console.log("Image metadata saved successfully");
      }
    }
  } catch (error) {
    console.error("Failed to authenticate user:", error);
  }
}

const fetchUserId = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    console.log("User ID fetched:", user.attributes.sub);
    return user.attributes.sub;
  } catch (error) {
    console.error("Error fetching user ID:", error.message);
    throw new Error("User not authenticated");
  }
};

const testApi = async (userId) => {
  try {
    const response = await axios.get(
      "https://996eyi0mva.execute-api.us-east-2.amazonaws.com/dev-stage/getUserImages",
      {
        params: { userId },
      }
    );
    console.log("API response:", response.data);
  } catch (error) {
    console.error("Error testing API endpoint:", error);
  }
};

const getImageAnalysis = async (imagePath, userId) => {
  try {
    const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
    const payload = {
      image_data: imageData,
      userId: userId,
    };
    console.log("Sending image for analysis with payload:", payload);

    const response = await axios.post(
      "https://8j01c6s5h4.execute-api.us-east-2.amazonaws.com/GPT-4VisionAnalysis",
      JSON.stringify(payload),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Image analysis response received:", response.data);
    return response.data;
  } catch (err) {
    console.error(
      "Error fetching image analysis:",
      err.response ? err.response.data : err.message
    );
    return null;
  }
};

const uploadImageToS3 = async (imagePath) => {
  const fileName = `${uuidv4()}_${path.basename(imagePath)}`;
  try {
    const imageData = fs.readFileSync(imagePath);
    const result = await Storage.put(fileName, imageData, {
      contentType: "image/jpeg",
    });
    console.log("Image uploaded to S3 successfully:", result.key);
    const imageUrl = `https://${awsconfig.aws_user_files_s3_bucket}.s3.${awsconfig.aws_user_files_s3_bucket_region}.amazonaws.com/public/${result.key}`;
    return imageUrl; // Return the S3 URL of the uploaded image
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    return null;
  }
};

const saveImageMetadata = async (userId, imageId, imageUrl, analysis) => {
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

    const response = await axios.post(
      "https://996eyi0mva.execute-api.us-east-2.amazonaws.com/dev-stage/saveImageMetadata",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Image metadata saved successfully", response.data);
  } catch (err) {
    console.error(
      "Error saving image metadata:",
      err.response ? err.response.data : err.message
    );
  }
};

// Example usage: replace 'shiv12345678' and 'Lebronisthegoat1!$' with actual credentials
const username = "shiv12345678";
const password = "Lebronisthegoat1!$";
signIn(username, password);
