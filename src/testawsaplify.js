const { Amplify, Auth } = require("aws-amplify");
const awsconfig = require("./aws-exports");

// Debugging: Print the configuration object to ensure it's correct
console.log("AWS Config:", JSON.stringify(awsconfig, null, 2));

Amplify.configure(awsconfig);

console.log(Amplify);
console.log(Auth);
