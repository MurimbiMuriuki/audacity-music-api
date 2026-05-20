const { execFile } = require("child_process");
const fs = require("fs");

const ffprobePath = process.env.FFPROBE_PATH || "ffprobe";

// Log on startup
console.log("=== FFPROBE CONFIG ===");
console.log("FFPROBE_PATH env:", process.env.FFPROBE_PATH);
console.log("ffprobePath using:", ffprobePath);
console.log("ffprobe exists:", fs.existsSync(ffprobePath));
console.log("=====================");

function getAudioDuration(filePath) {
  return new Promise((resolve) => {
    
    // Log before execution
    console.log("=== GET AUDIO DURATION ===");
    console.log("ffprobePath:", ffprobePath);
    console.log("filePath:", filePath);
    console.log("file exists:", fs.existsSync(filePath));
    console.log("==========================");

    const args = [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath,
    ];

    console.log("Executing ffprobe with args:", args);

    execFile(ffprobePath, args, (error, stdout, stderr) => {
      
      console.log("=== FFPROBE RESULT ===");
      console.log("error:", error ? error.message : "none");
      console.log("stdout:", stdout);
      console.log("stderr:", stderr);
      console.log("======================");

      if (error) {
        console.error("❌ ffprobe failed:", error.message);
        return resolve(null);
      }

      const duration = parseFloat(stdout.trim());
      console.log("Parsed duration:", duration);
      console.log("Final duration:", isNaN(duration) ? null : Math.round(duration * 100) / 100);
      
      resolve(isNaN(duration) ? null : Math.round(duration * 100) / 100);
    });
  });
}

module.exports = {getAudioDuration};