const Amplify = require("aws-amplify").default;
const Auth = require("aws-amplify").Auth;
const awsconfig = require("./aws-exports.js");

// Configure Amplify with the AWS settings
Amplify.configure(awsconfig);

async function signIn(username, password) {
  try {
    const user = await Auth.signIn(username, password);
    console.log("Authenticated user:", user);
    console.log("User is authenticated");
  } catch (error) {
    console.log("Failed to authenticate user:", error);
    console.log("User is not authenticated");
  }
}

// Example usage: replace 'your-username' and 'your-password' with actual credentials
const username = "shiv12345678";
const password = "Lebronisthegoat1!$";
signIn(username, password);
