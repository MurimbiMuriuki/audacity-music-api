require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const logMiddleware = require('./api/v1/middleware/dbLogger');
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8000;

// ✅ ENABLE CORS HERE
app.use(cors({
  origin: '*', // or 'http://localhost:3000' to restrict
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-access-token']
}));
app.use((req, res, next) => {
  const allowedFrameAncestors = [
    "http://localhost:3000",
    "https://crm.jurl.in"
  ];

  const cspValue = `frame-ancestors ${allowedFrameAncestors.join(" ")}`;
  res.setHeader("Content-Security-Policy", cspValue);

  // X-Frame-Options doesn't support multiple origins, use SAMEORIGIN or drop it if not needed
  // res.setHeader("X-Frame-Options", "SAMEORIGIN"); // Optional

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use(logMiddleware);  // Add your log middleware here




app.get("/test", (req, res) => {
  res.send("404");
});

app.use('/uploads', express.static('uploads'));

app.get("/uploads/cv/:fileName", (req, res) => {
  const filePath = path.join(__dirname, "uploads/cv", req.params.fileName);

  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("X-Frame-Options", "ALLOWALL"); // 👈 allow iframe embed
    res.setHeader("Content-Disposition", "inline; filename=" + req.params.fileName);

    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});
// app.use("/uploads", express.static("public/uploads"));

let options = {};

// app.use(
//   "/apidocs",
//   (req, res, next) => {
//     let user = auths(req);
//     if (
//       user === undefined ||
//       user["name"] !== "admin" ||
//       user["pass"] !== "admin"
//     ) {
//       res.statusCode = 401;
//       res.setHeader("WWW-Authenticate", 'Basic realm="Node"');
//       res.end("Unauthorized");
//     } else {
//       next();
//     }
//   },
//   swaggerUi.serveFiles(swaggerDocumentV_1_0_0, options),
//   swaggerUi.setup(swaggerDocumentV_1_0_0)
// );


// ✅ MAIN ROUTES
app.use("/api", require("./api"));

app.use((req, res) => {
  res.status(404).send('404');
});


app.listen(PORT, () => {
  console.log(`Server Running here :point_right: http://localhost:${PORT}`);
});