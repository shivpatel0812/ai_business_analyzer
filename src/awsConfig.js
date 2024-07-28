import AWS from "aws-sdk";
import awsmobile from "./aws-exports";

// Initialize the Amazon S3 credentials
AWS.config.update({
  accessKeyId: "AKIAT7NSQPGG2YWHQDQW",
  secretAccessKey: "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",
  region: awsmobile.aws_project_region,
});

const s3 = new AWS.S3({
  params: { Bucket: awsmobile.Storage.AWSS3.bucket },
});

export default s3;
