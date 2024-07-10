const axios = require("axios");
const { Auth } = require("aws-amplify");

// Your Cognito credentials
const USERNAME = "shiv12345678";
const PASSWORD = "Lebronisthegoat1!$";

// Function to sign in the user with Cognito
const signInUser = async (username, password) => {
  try {
    const user = await Auth.signIn(username, password);
    console.log("Login successful:", user);
    return user;
  } catch (error) {
    console.error("Authentication error:", error.message);
    throw new Error("Authentication failed");
  }
};

// Function to fetch user ID
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

// Function to test the API endpoint
const testApi = async (userId) => {
  try {
    const response = await axios.get(
      "https://996eyi0mva.execute-api.us-east-2.amazonaws.com/dev-stage",
      {
        params: { userId },
      }
    );

    console.log("API response:", response.data);
  } catch (error) {
    console.error("Error testing API endpoint:", error);
  }
};

// Main function to run the script
const main = async () => {
  try {
    // Sign in the user
    await signInUser(USERNAME, PASSWORD);

    // Fetch user ID and test the API
    const userId = await fetchUserId();
    await testApi(userId);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Run the main function
main();
