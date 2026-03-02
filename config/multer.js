const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "cover") {
      cb(null, "uploads/covers/");
    } else if (file.fieldname === "audio") {
      cb(null, "uploads/audios/");
    } else if (file.fieldname === "playlistCover") {
      cb(null, "uploads/playlists/");
    }
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = upload;