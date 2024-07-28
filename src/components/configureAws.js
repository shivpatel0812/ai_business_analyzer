import AWS from "aws-sdk";
import { getAuth } from "firebase/auth";
import awsconfig from "./aws-exports";

const configureAwsWithFirebaseToken = () => {
  const auth = getAuth();
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const idToken = await user.getIdToken(true);

      AWS.config.update({
        region: awsconfig.aws_project_region,
      });

      const credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: awsconfig.aws_cognito_identity_pool_id,
        Logins: {
          "accounts.google.com": idToken,
        },
      });

      AWS.config.credentials = credentials;

      credentials.refresh((error) => {
        if (error) {
          console.error("Error refreshing AWS credentials:", error);
        } else {
          console.log("AWS credentials refreshed successfully");
        }
      });

      console.log("User authenticated with Firebase:", idToken);
      console.log("AWS configured with Firebase token.");
    } else {
      console.log("User is not authenticated");
    }
  });
};

export default configureAwsWithFirebaseToken;
