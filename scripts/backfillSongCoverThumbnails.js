/**
 * One-off backfill: generates a 300x300 WebP `thumbnailUrl` for every Song
 * that predates the dedicated-thumbnail feature (api/v1/helper/supabase.helper.js),
 * reusing the same resize path a fresh upload goes through. `coverUrl` (the
 * original full-resolution image) is never touched.
 *
 * Usage:
 *   node scripts/backfillSongCoverThumbnails.js --dry-run   # preview only
 *   node scripts/backfillSongCoverThumbnails.js             # apply
 */
require("dotenv").config();
const db = require("../api/v1/models");
const { uploadSongCoverThumbnail } = require("../api/v1/helper/supabase.helper");

const DRY_RUN = process.argv.includes("--dry-run");

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`download failed with status ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function run() {
  const songs = await db.songObj.findAll({
    where: {
      coverUrl: { [db.Op.ne]: null },
      thumbnailUrl: null,
    },
    attributes: ["id", "coverUrl", "thumbnailUrl"],
  });

  console.log(`Found ${songs.length} songs missing a thumbnail.${DRY_RUN ? " (dry run)" : ""}`);

  let updated = 0;
  let failed = 0;

  for (const song of songs) {
    if (DRY_RUN) {
      console.log(`[${song.id}] would generate thumbnail from: ${song.coverUrl}`);
      updated++;
      continue;
    }

    try {
      const buffer = await downloadImage(song.coverUrl);
      const fakeFile = {
        fieldname: "cover",
        originalname: `song-${song.id}-cover.jpg`,
        mimetype: "image/jpeg",
        buffer,
      };

      const thumbnailUrl = await uploadSongCoverThumbnail(fakeFile);
      await song.update({ thumbnailUrl });

      updated++;
      console.log(`[${song.id}] updated -> ${thumbnailUrl}`);
    } catch (err) {
      failed++;
      console.error(`[${song.id}] FAILED: ${err.message}`);
    }
  }

  console.log(`Done. updated=${updated} failed=${failed}`);
}

run()
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exitCode = 1;
  })
  .finally(() => db.dbObj.close());
