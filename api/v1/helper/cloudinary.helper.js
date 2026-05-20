const cloudinary = require("../../../config/cloudinary");

const UPLOAD_CONFIG = {
  audio: { folder: "audacity-music/audios", resource_type: "video" },
  cover: { folder: "audacity-music/covers", resource_type: "image" },
  playlistCover: { folder: "audacity-music/playlists", resource_type: "image" },
};

function uploadToCloudinary(file) {
  const config = UPLOAD_CONFIG[file.fieldname] || { folder: "audacity-music/misc", resource_type: "auto" };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: config.folder, resource_type: config.resource_type },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
}

module.exports = { uploadToCloudinary };
