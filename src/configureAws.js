import { Amplify } from "@aws-amplify/core";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import awsconfig from "./aws-exports";

// Initialize AWS Amplify with only the necessary configurations
Amplify.configure({
  Storage: {
    AWSS3: {
      bucket: awsconfig.aws_user_files_s3_bucket,
      region: awsconfig.aws_user_files_s3_bucket_region,
    },
  },
});

const configureAwsWithFirebaseToken = () => {
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const idToken = await user.getIdToken(true);
      // Do not configure Auth for Amplify as we are using Firebase Auth

      console.log("AWS configured with Firebase token.");
    } else {
      console.log("User is not authenticated");
    }
  });
};

export default configureAwsWithFirebaseToken;
