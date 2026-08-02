// Lists what's already in the MinIO bucket, for the CMS media picker's
// "choose existing" view. Same credential/token handling as
// media-sign-upload.js — see that file for why.
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const REQUIRED_ENV = [
  "MINIO_ENDPOINT",
  "MINIO_ACCESS_KEY",
  "MINIO_SECRET_KEY",
  "MINIO_BUCKET",
  "MINIO_PUBLIC_URL",
  "MEDIA_API_TOKEN",
];

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      return { statusCode: 500, body: `Server not configured: missing ${key}` };
    }
  }

  if (event.headers["x-media-token"] !== process.env.MEDIA_API_TOKEN) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const client = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT,
    region: "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY,
      secretAccessKey: process.env.MINIO_SECRET_KEY,
    },
  });

  const result = await client.send(new ListObjectsV2Command({ Bucket: process.env.MINIO_BUCKET }));
  const publicBase = process.env.MINIO_PUBLIC_URL.replace(/\/$/, "");
  const files = (result.Contents || [])
    .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
    .map((obj) => ({
      key: obj.Key,
      url: `${publicBase}/${obj.Key}`,
      name: obj.Key,
      size: obj.Size,
    }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  };
};
