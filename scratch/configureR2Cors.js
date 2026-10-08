import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = "2fa2570c33fef6e98f9aa96f72cb3f9e";
const R2_BUCKET_NAME = "media-videos-calendario";
const R2_ACCESS_KEY_ID = "c84df04bc3e21f51b2e214cb58201019";
const R2_SECRET_ACCESS_KEY = "bd6ed6fb7916a69d7d187995c21b4c17503865a680346be4c48c22b2ff56016a";
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function configureCors() {
  console.log(`Configurando reglas CORS en el bucket Cloudflare R2: "${R2_BUCKET_NAME}"...`);

  const corsRules = {
    Bucket: R2_BUCKET_NAME,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          AllowedOrigins: ["*"],
          ExposeHeaders: ["ETag", "Content-Type", "Content-Length"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  };

  try {
    const putRes = await s3Client.send(new PutBucketCorsCommand(corsRules));
    console.log("SUCCESS: Reglas CORS aplicadas correctamente en Cloudflare R2:", putRes);

    const getRes = await s3Client.send(new GetBucketCorsCommand({ Bucket: R2_BUCKET_NAME }));
    console.log("Verificación de reglas CORS configuradas:", JSON.stringify(getRes.CORSRules, null, 2));
  } catch (err) {
    console.error("ERROR aplicando CORS en R2:", err);
  }
}

configureCors();
