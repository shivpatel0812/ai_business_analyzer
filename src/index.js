import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
import App from "./App";
import configureAwsWithFirebaseToken from "./configureAws";

// Initialize AWS Amplify with Storage configuration
Amplify.configure({
  Storage: {
    AWSS3: {
      bucket: awsconfig.aws_user_files_s3_bucket,
      region: awsconfig.aws_user_files_s3_bucket_region,
    },
  },
});

// Configure AWS with Firebase token
configureAwsWithFirebaseToken();

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById("root")
);
