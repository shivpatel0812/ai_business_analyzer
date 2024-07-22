import Amplify from "aws-amplify";
import awsmobile from "./aws-exports";

awsmobile.aws_project_region = 'us-east-2'; // replace with your bucket's region

Amplify.configure(awsmobile);