# Audacity Music API

Node.js + Express backend API for a music platform with:
- authentication and user management
- song upload and song catalog
- playlist creation and playlist-song mapping
- admin dashboard and artist stream/payout exports

## Tech Stack
- Node.js
- Express.js
- MySQL
- Sequelize
- JWT
- Multer (file uploads)

## Project Structure
```
.
├── api/
│   └── v1/
│       ├── controller/
│       ├── helper/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── services/
├── apidocs/
├── config/
├── migrations/
├── seeders/
├── uploads/
├── index.js
└── package.json
```

## Prerequisites
- Node.js 18+
- MySQL 8+

## Installation
```bash
git clone <your-repo-url>
cd AudacityMusic
npm install
```

## Environment Variables
Create `.env` from `sample.env` and update values:

```env
DB_HOST=127.0.0.1
DB_NAME=audacity_music
DB_USERNAME=root
DB_PASSWORD=password
DB_PORT=3306

DEFAULT_USERNAME=Admin
DEFAULT_EMAIL=admin@gmail.com
DEFAULT_PASSWORD=123456

BASE_CLIENT_URL=http://localhost:3000

# SMTP (for Contact Us email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user@example.com
SMTP_PASS=your-smtp-password
CONTACT_FROM_EMAIL=no-reply@audacitymusic.com
CONTACT_RECEIVER_EMAIL=client-inbox@example.com
# Optional for IP whitelist middleware
# IP_ALLOWLIST=127.0.0.1,::1
# PORT=5000
```

## Run Locally
```bash
npm run dev
```

Server runs on:
- `http://localhost:5000` (default)

## API Base URL
- `/api/v1`

Example:
- `http://localhost:5000/api/v1/auth/login`

## Main Route Groups
### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/getAllUser`
- `GET /api/v1/auth/getUserById`
- `PUT /api/v1/auth/updateUser/:id`
- `DELETE /api/v1/auth/deleteUser/:id`

### Song
- `POST /api/v1/song/uploadSong`
- `GET /api/v1/song/getAllUploadSong`
- `GET /api/v1/song/getByIdSong`
- `PUT /api/v1/song/updateSong`
- `DELETE /api/v1/song/deleteSong`
- `GET /api/v1/song/getSongsByArtist`
- `GET /api/v1/song/searchDashboard`
- `GET /api/v1/public/getLandingPageSong`

### Playlist
- `POST /api/v1/playList/addPlaylist`
- `GET /api/v1/playlist/getAllPlayList`

### Playlist Song
- `POST /api/v1/playListSong/addPlaylistSong`
- `GET /api/v1/playListSong/getAllSongsByPlaylist`

### Admin
- `GET /api/v1/admin/getAllAdminDashboard`
- `GET /api/v1/admin/getAllSubscribers`
- `GET /api/v1/admin/getAllUploadedSongs`
- `DELETE /api/v1/admin/deleteSong`
- `GET /api/v1/admin/getArtistStreams`
- `GET /api/v1/admin/exportArtistStreamsCsv`

### Contact
- `POST /api/v1/contact/sendMessage` (protected)

## Upload Directories
Static files are served from:
- `/uploads`

Common folders:
- `uploads/covers`
- `uploads/audios`
- `uploads/playlists`

## Database
This project uses Sequelize models and migrations.

If Sequelize CLI is installed/configured in your environment, run migrations with:
```bash
npx sequelize-cli db:migrate
```

## Notes
- Some routes are protected by JWT middleware (`x-access-token` header).
- Swagger setup exists in code but is currently commented out in `index.js`.
