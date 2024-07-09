const Amplify = require("aws-amplify").default;
const Auth = require("aws-amplify").Auth;
const axios = require("axios");
const awsconfig = require("./aws-exports.js");

// Configure Amplify with the AWS settings
Amplify.configure(awsconfig);

async function signIn(username, password) {
  try {
    const user = await Auth.signIn(username, password);
    console.log("Authenticated user:", user);

    // Fetch user ID and test the API
    const userId = await fetchUserId();
    await testApi(userId);

    // Upload an image and save its metadata
    const imageUrl = "https://images.app.goo.gl/euSevnswZDdAEDHx6"; // Replace with actual image URL
    const analysis = { key: "value" }; // Replace with actual analysis data
    const imageId = "unique-image-id"; // Replace with actual image ID
    await saveImageMetadata(userId, imageId, imageUrl, analysis);
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

const saveImageMetadata = async (userId, imageId, imageUrl, analysis) => {
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
