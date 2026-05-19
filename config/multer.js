const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (file.fieldname === "audio") {
      return {
        folder: "audacity-music/audios",
        resource_type: "video",
        allowed_formats: ["mp3", "wav", "aac", "ogg", "m4a", "flac"],
      };
    }
    if (file.fieldname === "cover") {
      return {
        folder: "audacity-music/covers",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      };
    }
    if (file.fieldname === "playlistCover") {
      return {
        folder: "audacity-music/playlists",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      };
    }
    return { folder: "audacity-music/misc" };
  },
});

const upload = multer({ storage });

module.exports = upload;
