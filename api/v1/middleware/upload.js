const multer = require("multer");
const path = require("path");
const moment = require("moment-timezone");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
     cb(null, "uploads/avatars"); 
    
  },
  filename: function (req, file, cb) {
    const originalName = path.parse(file.originalname).name;

    const indiaTime = moment().tz("Asia/Kolkata").format("x");
    cb(null, `${indiaTime}-${originalName}${path.extname(file.originalname)}`);

  }
});

const upload = multer({ storage: storage });

module.exports = upload;
