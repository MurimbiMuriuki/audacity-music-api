const { execFile } = require("child_process");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

let ffmpegPath = process.env.FFMPEG_PATH;
if (!ffmpegPath) {
  try {
    ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
  } catch (e) {
    ffmpegPath = "ffmpeg";
  }
}

const AUDIO_BITRATE = "128k";

// Re-encodes uploaded audio to AAC/.m4a so large lossless uploads (e.g. WAV)
// become a fraction of the size for slow-connection playback, while keeping
// the container/codec combo natively playable on iOS and Android.
async function transcodeAudioToAac(buffer, originalExt) {
  const tmpId = crypto.randomUUID();
  const inputPath = path.join(os.tmpdir(), `audio-in-${tmpId}${originalExt || ""}`);
  const outputPath = path.join(os.tmpdir(), `audio-out-${tmpId}.m4a`);

  await fs.writeFile(inputPath, buffer);

  try {
    await new Promise((resolve, reject) => {
      execFile(
        ffmpegPath,
        [
          "-y",
          "-v", "error",
          "-i", inputPath,
          "-vn",
          "-map_metadata", "-1",
          "-c:a", "aac",
          "-b:a", AUDIO_BITRATE,
          "-movflags", "+faststart",
          outputPath,
        ],
        (error) => (error ? reject(error) : resolve())
      );
    });

    const outputBuffer = await fs.readFile(outputPath);
    return { buffer: outputBuffer, ext: ".m4a", mimetype: "audio/mp4" };
  } finally {
    await Promise.all([
      fs.unlink(inputPath).catch(() => {}),
      fs.unlink(outputPath).catch(() => {}),
    ]);
  }
}

module.exports = { transcodeAudioToAac };
