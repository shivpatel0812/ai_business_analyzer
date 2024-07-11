const Amplify = require("aws-amplify").default;
const Auth = require("aws-amplify").Auth;
const axios = require("axios");
const awsconfig = require("./aws-exports.js");
const fs = require("fs");
const path = require("path");

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
    const imagePath = path.join(__dirname, "image.png"); // Path to the image file
    const imageId = "unique-image-id"; // Replace with actual image ID

    const analysis = await getImageAnalysis(imagePath, userId);
    if (analysis) {
      const imageUrl = await saveImageToS3(imagePath, imageId); // Upload the image to S3 and get its URL
      await saveImageMetadata(userId, imageId, imageUrl, analysis);
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

const saveImageToS3 = async (imagePath, imageId) => {
  try {
    const imageData = fs.readFileSync(imagePath);
    const response = await axios.put(
      `https://your-api-gateway-url-to-upload-image/${imageId}`,
      imageData,
      {
        headers: {
          "Content-Type": "image/png",
        },
      }
    );
    console.log("Image uploaded to S3 successfully:", response.data);
    return response.data.imageUrl; // Assuming the response contains the image URL
  } catch (err) {
    console.error("Error uploading image to S3:", err.message);
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
