const crypto = require("crypto");
const path = require("path");
const sharp = require("sharp");
const supabase = require("../../../config/supabase");
const { transcodeAudioToAac } = require("./audioTranscode.helper");

const UPLOAD_CONFIG = {
  audio: { bucket: "audios", contentType: "audio/" },
  cover: { bucket: "covers", contentType: "image/" },
  playlistCover: { bucket: "playlists", contentType: "image/" },
};

// Cover images are only ever displayed as small thumbnails (admin tables,
// playlist rows, mobile art) - downsize + re-encode as webp instead of
// storing the full-resolution upload.
const THUMBNAIL_FIELDS = new Set(["cover", "playlistCover"]);
const THUMBNAIL_MAX_DIMENSION = 500;
const THUMBNAIL_WEBP_QUALITY = 80;

async function uploadToSupabase(file) {
  const config = UPLOAD_CONFIG[file.fieldname] || { bucket: "misc" };

  let buffer = file.buffer;
  let contentType = file.mimetype;
  let ext = path.extname(file.originalname);

  if (THUMBNAIL_FIELDS.has(file.fieldname)) {
    buffer = await sharp(file.buffer)
      .resize(THUMBNAIL_MAX_DIMENSION, THUMBNAIL_MAX_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: THUMBNAIL_WEBP_QUALITY })
      .toBuffer();
    contentType = "image/webp";
    ext = ".webp";
  }

  if (file.fieldname === "audio") {
    try {
      const transcoded = await transcodeAudioToAac(file.buffer, ext);
      buffer = transcoded.buffer;
      contentType = transcoded.mimetype;
      ext = transcoded.ext;
    } catch (err) {
      console.error("Audio transcode failed, uploading original file:", err.message);
    }
  }

  const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(config.bucket)
    .upload(fileName, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(config.bucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

async function deleteFromSupabase(publicUrl) {
  if (!publicUrl) return;

  // URL format: https://<host>/storage/v1/object/public/<bucket>/<filename>
  const match = publicUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) return;

  const [, bucket, filePath] = match;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    console.error(`Supabase delete failed for ${bucket}/${filePath}:`, error.message);
  }
}

module.exports = { uploadToSupabase, deleteFromSupabase };
