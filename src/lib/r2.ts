import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId  = process.env.CLOUDFLARE_R2_ACCOUNT_ID!;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const publicUrl  = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Generate a presigned PUT URL for a profile photo upload.
 * The client uploads directly to R2; the Next.js server never handles the bytes.
 *
 * @param key      - Storage key, e.g. "profiles/42/abc123.jpg"
 * @param contentType - MIME type of the file, e.g. "image/jpeg"
 * @returns { uploadUrl, publicUrl }
 */
export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
): Promise<{ uploadUrl: string; filePublicUrl: string }> {
  const command = new PutObjectCommand({
    Bucket:      bucketName,
    Key:         key,
    ContentType: contentType,
  });

  const uploadUrl     = await getSignedUrl(client, command, { expiresIn: 60 });
  const filePublicUrl = `${publicUrl}/${key}`;

  return { uploadUrl, filePublicUrl };
}
