require('dotenv').config();
const express = require("express");
const cors = require("cors");
const logMiddleware = require('./api/v1/middleware/dbLogger');
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-access-token', 'authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logMiddleware);

app.get("/test", (req, res) => {
  res.send("Server is running");
});

app.use('/uploads', express.static('uploads'));

app.get("/uploads/cv/:fileName", (req, res) => {
  const filePath = path.join(__dirname, "uploads/cv", req.params.fileName);

  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=" + req.params.fileName);
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

app.use("/api", require("./api"));

app.use((req, res) => {
  res.status(404).send('404');
});

app.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});
