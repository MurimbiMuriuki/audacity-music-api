const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ffprobePath = process.env.FFPROBE_PATH || "ffprobe";

function getAudioDurationFromBuffer(buffer) {
  return new Promise((resolve) => {
    const tmpFile = path.join(os.tmpdir(), `audio-${Date.now()}.tmp`);
    fs.writeFileSync(tmpFile, buffer);

    const args = [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      tmpFile,
    ];

    execFile(ffprobePath, args, (error, stdout) => {
      fs.unlink(tmpFile, () => {});

      if (error) {
        console.error("ffprobe error:", error.message);
        return resolve(null);
      }
      const duration = parseFloat(stdout.trim());
      resolve(isNaN(duration) ? null : Math.round(duration * 100) / 100);
    });
  });
}

module.exports = { getAudioDurationFromBuffer };
