import { Amplify } from "@aws-amplify/core";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import awsconfig from "./aws-exports";

// Initial AWS Amplify Storage configuration
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

      // Ensure no Auth configuration is set, only log the token for now
      console.log("User authenticated with Firebase:", idToken);
      // Optionally, you can add any other Firebase-related logic here

      console.log("AWS configured with Firebase token.");
    } else {
      console.log("User is not authenticated");
    }
  });
};

export default configureAwsWithFirebaseToken;
