import { Amplify } from "@aws-amplify/core";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import awsconfig from "./aws-exports";

// Initialize AWS Amplify
Amplify.configure(awsconfig);

const configureAwsWithFirebaseToken = () => {
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const idToken = await user.getIdToken(true);

      Amplify.configure({
        Auth: {
          identityPoolId: awsconfig.aws_cognito_identity_pool_id,
          region: awsconfig.aws_project_region,
          userPoolId: awsconfig.aws_user_pools_id,
          userPoolWebClientId: awsconfig.aws_user_pools_web_client_id,
          identityPoolRegion: awsconfig.aws_project_region,
          mandatorySignIn: true,
          logins: {
            "cognito-identity.amazonaws.com": idToken,
          },
        },
        Storage: {
          AWSS3: {
            bucket: awsconfig.aws_user_files_s3_bucket,
            region: awsconfig.aws_user_files_s3_bucket_region,
          },
        },
      });

      console.log("AWS configured with Firebase token.");
    } else {
      console.log("User is not authenticated");
    }
  });
};

export default configureAwsWithFirebaseToken;
