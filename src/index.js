import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { Amplify } from "aws-amplify"; // Correct the import statement
import awsconfig from "./aws-exports";
import App from "./App";

Amplify.configure(awsconfig);

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById("root")
);
