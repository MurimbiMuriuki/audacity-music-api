const crypto = require("crypto");
const path = require("path");
const supabase = require("../../../config/supabase");

const UPLOAD_CONFIG = {
  audio: { bucket: "audios", contentType: "audio/" },
  cover: { bucket: "covers", contentType: "image/" },
  playlistCover: { bucket: "playlists", contentType: "image/" },
};

async function uploadToSupabase(file) {
  const config = UPLOAD_CONFIG[file.fieldname] || { bucket: "misc" };
  const ext = path.extname(file.originalname);
  const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(config.bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
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
