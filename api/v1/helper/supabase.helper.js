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

// Playlist covers have no separate thumbnail column, so they're still
// replaced in place with a single resized WebP.
const REPLACE_WITH_THUMBNAIL_FIELDS = new Set(["playlistCover"]);
const PLAYLIST_THUMBNAIL_MAX_DIMENSION = 500;

// Song covers keep their original upload (coverUrl) and additionally get a
// dedicated small thumbnail (thumbnailUrl) for low-bandwidth clients.
const SONG_THUMBNAIL_MAX_DIMENSION = 300;

const WEBP_QUALITY = 80;

async function resizeToWebp(buffer, maxDimension, quality = WEBP_QUALITY) {
  return sharp(buffer)
    .resize(maxDimension, maxDimension, { fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
}

async function uploadBufferToSupabase(bucket, buffer, ext, contentType) {
  const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

async function uploadToSupabase(file) {
  const config = UPLOAD_CONFIG[file.fieldname] || { bucket: "misc" };

  let buffer = file.buffer;
  let contentType = file.mimetype;
  let ext = path.extname(file.originalname);

  if (REPLACE_WITH_THUMBNAIL_FIELDS.has(file.fieldname)) {
    buffer = await resizeToWebp(buffer, PLAYLIST_THUMBNAIL_MAX_DIMENSION);
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

  return uploadBufferToSupabase(config.bucket, buffer, ext, contentType);
}

// Generates and uploads a 300x300 WebP thumbnail for a song cover, stored
// alongside (not replacing) the original upload in the `covers` bucket.
async function uploadSongCoverThumbnail(file) {
  const buffer = await resizeToWebp(file.buffer, SONG_THUMBNAIL_MAX_DIMENSION);
  return uploadBufferToSupabase(UPLOAD_CONFIG.cover.bucket, buffer, ".webp", "image/webp");
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

module.exports = { uploadToSupabase, uploadSongCoverThumbnail, deleteFromSupabase };
