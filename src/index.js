import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal"; // Import Modal from react-modal
import Amplify from "aws-amplify";
import awsconfig from "./aws-exports";
import App from "./App";

// Configure Amplify
Amplify.configure(awsconfig);

// Set the root element for react-modal
Modal.setAppElement("#root");

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
