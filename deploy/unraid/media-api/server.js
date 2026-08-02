// Standalone version of what would have been Netlify Functions — same job
// (issue presigned upload URLs, list what's in the bucket), just running as
// its own long-lived container instead of a serverless function, so it
// doesn't depend on Netlify's build pipeline at all.
const http = require("http");
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const REQUIRED_ENV = [
  "MINIO_ENDPOINT",
  "MINIO_ACCESS_KEY",
  "MINIO_SECRET_KEY",
  "MINIO_BUCKET",
  "MINIO_PUBLIC_URL",
  "MEDIA_API_TOKEN",
];

const PORT = process.env.PORT || 8090;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

function missingEnv() {
  return REQUIRED_ENV.filter((k) => !process.env[k]);
}

function s3Client() {
  return new S3Client({
    endpoint: process.env.MINIO_ENDPOINT,
    region: "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY,
      secretAccessKey: process.env.MINIO_SECRET_KEY,
    },
  });
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type, x-media-token",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    return send(res, 204, {});
  }

  const missing = missingEnv();
  if (missing.length) {
    return send(res, 500, { error: `Server not configured: missing ${missing.join(", ")}` });
  }

  if (req.headers["x-media-token"] !== process.env.MEDIA_API_TOKEN) {
    return send(res, 401, { error: "Unauthorized" });
  }

  try {
    if (req.method === "POST" && req.url === "/sign-upload") {
      const body = JSON.parse((await readBody(req)) || "{}");
      const { filename, contentType } = body;
      if (!filename) return send(res, 400, { error: "filename is required" });

      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
      const key = `${Date.now()}-${safeName}`;

      const client = s3Client();
      const command = new PutObjectCommand({
        Bucket: process.env.MINIO_BUCKET,
        Key: key,
        ContentType: contentType || "application/octet-stream",
      });
      const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
      const publicUrl = `${process.env.MINIO_PUBLIC_URL.replace(/\/$/, "")}/${key}`;

      return send(res, 200, { uploadUrl, publicUrl, key });
    }

    if (req.method === "GET" && req.url === "/list") {
      const client = s3Client();
      const result = await client.send(new ListObjectsV2Command({ Bucket: process.env.MINIO_BUCKET }));
      const publicBase = process.env.MINIO_PUBLIC_URL.replace(/\/$/, "");
      const files = (result.Contents || [])
        .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
        .map((obj) => ({ key: obj.Key, url: `${publicBase}/${obj.Key}`, name: obj.Key, size: obj.Size }));
      return send(res, 200, { files });
    }

    return send(res, 404, { error: "Not found" });
  } catch (err) {
    return send(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => console.log(`media-api listening on :${PORT}`));
