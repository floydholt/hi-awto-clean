/**
 * scripts/upload-demo-images.js
 *
 * USAGE:
 *   node scripts/upload-demo-images.js ./demo-images
 *
 * REQUIREMENTS:
 *   - service-account.json (local, never commit)
 *   - A directory of images to upload
 */

const { initializeApp, applicationDefault, cert } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");
const fs = require("fs");
const path = require("path");

// ---- SETTINGS ----
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), "service-account.json");
const BUCKET_FOLDER = "listings/demo"; // uploaded to: gs://bucket/listings/demo/...

// Ensure argument provided
if (process.argv.length < 3) {
  console.error("❌ Please provide a folder path.\nExample:");
  console.error("   node scripts/upload-demo-images.js ./demo-images");
  process.exit(1);
}

const folderPath = path.resolve(process.argv[2]);

// Validate folder
if (!fs.existsSync(folderPath)) {
  console.error("❌ Folder not found:", folderPath);
  process.exit(1);
}

if (!fs.lstatSync(folderPath).isDirectory()) {
  console.error("❌ Not a directory:", folderPath);
  process.exit(1);
}

// Validate service account
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("❌ service-account.json not found. Place it in project root.");
  process.exit(1);
}

console.log("🔐 Loading service account:", SERVICE_ACCOUNT_PATH);

// Init Firebase Admin
initializeApp({
  credential: cert(require(SERVICE_ACCOUNT_PATH)),
  storageBucket: `${process.env.FIREBASE_STORAGE_BUCKET || "hi-awto.appspot.com"}`,
});

const bucket = getStorage().bucket();

async function uploadFile(filePath) {
  const fileName = path.basename(filePath);
  const dest = `${BUCKET_FOLDER}/${Date.now()}_${fileName}`;

  try {
    await bucket.upload(filePath, {
      destination: dest,
      metadata: {
        cacheControl: "public,max-age=31536000",
      },
    });

    const file = bucket.file(dest);

    // Generate signed URL (one-year expiry)
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    });

    return { fileName, storagePath: dest, url };
  } catch (err) {
    console.error("❌ Upload error:", fileName, err.message);
    return null;
  }
}

(async function run() {
  const files = fs.readdirSync(folderPath);

  const imageFiles = files.filter((f) =>
    f.match(/\.(jpg|jpeg|png|webp|gif)$/i)
  );

  if (imageFiles.length === 0) {
    console.error("❌ No image files found in", folderPath);
    process.exit(1);
  }

  console.log(`📁 Found ${imageFiles.length} image(s) in ${folderPath}`);
  console.log("⬆️  Uploading to Firebase Storage...\n");

  const results = [];

  for (const file of imageFiles) {
    const fullPath = path.join(folderPath, file);
    const result = await uploadFile(fullPath);
    if (result) results.push(result);
  }

  console.log("\n🎉 Upload Complete!");
  console.log("-------------------------------------------");

  for (const r of results) {
    console.log(`📸 ${r.fileName}`);
    console.log(`   Storage: ${r.storagePath}`);
    console.log(`   URL:     ${r.url}`);
    console.log("-------------------------------------------");
  }

  console.log("✨ All demo images uploaded.\nPaste the URLs into Firestore listings.");
})();
