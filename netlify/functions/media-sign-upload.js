// Issues a short-lived presigned PUT URL for uploading one file directly to
// the self-hosted MinIO bucket. The browser never sees the MinIO access/
// secret keys — only this function (running server-side on Netlify) does.
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const REQUIRED_ENV = [
  "MINIO_ENDPOINT",
  "MINIO_ACCESS_KEY",
  "MINIO_SECRET_KEY",
  "MINIO_BUCKET",
  "MINIO_PUBLIC_URL",
  "MEDIA_API_TOKEN",
];

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
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

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { filename, contentType } = body;
  if (!filename) {
    return { statusCode: 400, body: "filename is required" };
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `${Date.now()}-${safeName}`;

  const client = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT,
    region: "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY,
      secretAccessKey: process.env.MINIO_SECRET_KEY,
    },
  });

  const command = new PutObjectCommand({
    Bucket: process.env.MINIO_BUCKET,
    Key: key,
    ContentType: contentType || "application/octet-stream",
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicUrl = `${process.env.MINIO_PUBLIC_URL.replace(/\/$/, "")}/${key}`;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadUrl, publicUrl, key }),
  };
};
