import { Amplify } from "aws-amplify";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import awsconfig from "./aws-exports";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

// Initialize AWS Amplify
Amplify.configure(awsconfig);

const configureAwsWithFirebaseToken = async () => {
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const idToken = await user.getIdToken(true);

      const cognitoIdentity = new CognitoIdentityClient({
        region: awsconfig.aws_project_region,
      });

      const credentials = fromCognitoIdentityPool({
        client: cognitoIdentity,
        identityPoolId: awsconfig.aws_cognito_identity_pool_id,
        logins: {
          [`cognito-identity.amazonaws.com`]: idToken,
        },
      });

      Amplify.configure({
        ...awsconfig,
        Storage: {
          AWSS3: {
            bucket: awsconfig.Storage.AWSS3.bucket,
            region: awsconfig.Storage.AWSS3.region,
          },
        },
        Auth: {
          credentials,
        },
      });

      console.log("AWS configured with Firebase token.");
    } else {
      console.log("User is not authenticated");
    }
  });
};

export default configureAwsWithFirebaseToken;
