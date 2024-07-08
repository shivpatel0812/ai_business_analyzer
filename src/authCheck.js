const Amplify = require("aws-amplify").default;
const Auth = require("aws-amplify").Auth;
const axios = require("axios");
const awsconfig = require("./aws-exports.js");

// Configure Amplify with the AWS settings
Amplify.configure(awsconfig);

async function signIn(username, password) {
  try {
    const user = await Auth.signIn(username, password);
    // console.log("Authenticated user:", user);
    // console.log("User is authenticated");

    // Fetch user ID and test the API
    const userId = await fetchUserId();
    await testApi(userId);
  } catch (error) {
    // console.log("Failed to authenticate user:", error);
    // console.log("User is not authenticated");
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

// Example usage: replace 'shiv12345678' and 'Lebronisthegoat1!$' with actual credentials
const username = "shiv12345678";
const password = "Lebronisthegoat1!$";
signIn(username, password);
