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

module.exports = { uploadToSupabase };
