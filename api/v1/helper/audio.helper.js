const { execFile } = require("child_process");
const path = require("path");

/**
 * Get audio file duration in seconds using ffprobe.
 * Returns null if duration cannot be determined.
 */
function getAudioDuration(filePath) {
  return new Promise((resolve) => {
    const args = [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath,
    ];

    execFile("ffprobe", args, (error, stdout) => {
      if (error) {
        console.error("ffprobe error:", error.message);
        return resolve(null);
      }
      const duration = parseFloat(stdout.trim());
      resolve(isNaN(duration) ? null : Math.round(duration * 100) / 100);
    });
  });
}

module.exports = { getAudioDuration };
