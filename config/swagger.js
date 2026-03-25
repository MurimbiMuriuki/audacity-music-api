const swaggerUi = require("swagger-ui-express");
const basicAuth = require("basic-auth");

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Audacity Music API",
    version: "1.0.0",
    description: "REST API documentation for Audacity Music platform",
  },
  servers: [
    {
      url: "http://localhost:8000/api/v1",
      description: "Local Development",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "apiKey",
        in: "header",
        name: "x-access-token",
        description: "JWT token obtained from login or Google login",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          status: { type: "boolean", example: false },
          message: { type: "string" },
          data: { type: "object" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          role: { type: "string" },
          artistName: { type: "string", nullable: true },
          profileImage: { type: "string", nullable: true },
          paypalEmail: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          status: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Song: {
        type: "object",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          title: { type: "string" },
          coverUrl: { type: "string", nullable: true },
          audioUrl: { type: "string", nullable: true },
          duration: { type: "number", nullable: true },
          streamCount: { type: "integer" },
          artistName: { type: "string", description: "Derived from user" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Playlist: {
        type: "object",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          name: { type: "string" },
          coverUrl: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Auth", description: "Authentication & user management" },
    { name: "Songs", description: "Song management" },
    { name: "Playlists", description: "Playlist management" },
    { name: "Playlist Songs", description: "Manage songs in playlists" },
    { name: "Admin", description: "Admin dashboard endpoints" },
    { name: "Contact", description: "Contact form" },
    { name: "Public", description: "Public endpoints (no auth)" },
  ],
  paths: {
    // ─── AUTH ───
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "John Doe" },
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "password123" },
                  phone: { type: "string", example: "9876543210" },
                  role: { type: "string", example: "user" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "User registered successfully" },
          400: { description: "Registration failed" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email & password",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    access_token: { type: "string" },
                    token_type: { type: "string", example: "bearer" },
                    user: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        email: { type: "string" },
                        role: { type: "string" },
                      },
                    },
                    expires_in: { type: "integer" },
                  },
                },
              },
            },
          },
          400: { description: "Login failed" },
        },
      },
    },
    "/auth/google": {
      post: {
        tags: ["Auth"],
        summary: "Login with Google ID token",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["idToken"],
                properties: {
                  idToken: {
                    type: "string",
                    description: "Google OAuth ID token",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    access_token: { type: "string" },
                    token_type: { type: "string" },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        email: { type: "string" },
                        role: { type: "string" },
                        profileImage: { type: "string", nullable: true },
                      },
                    },
                    expires_in: { type: "integer" },
                  },
                },
              },
            },
          },
          400: { description: "Google login failed" },
        },
      },
    },
    "/auth/getAllUser": {
      get: {
        tags: ["Auth"],
        summary: "Get all users (paginated)",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          { name: "name", in: "query", schema: { type: "string" } },
          { name: "email", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Users list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        total: { type: "integer" },
                        page: { type: "integer" },
                        totalPages: { type: "integer" },
                        users: {
                          type: "array",
                          items: { $ref: "#/components/schemas/User" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/getUserById": {
      get: {
        tags: ["Auth"],
        summary: "Get user by ID",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "User details" },
          400: { description: "User not found" },
        },
      },
    },
    "/auth/updateUser/{id}": {
      put: {
        tags: ["Auth"],
        summary: "Update a user",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  phone: { type: "string" },
                  password: { type: "string" },
                  artistName: { type: "string" },
                  paypalEmail: { type: "string" },
                  isActive: { type: "boolean" },
                  status: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "User updated successfully" },
          400: { description: "Update failed" },
        },
      },
    },
    "/auth/deleteUser/{id}": {
      delete: {
        tags: ["Auth"],
        summary: "Delete a user",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "User deleted successfully" },
          400: { description: "Delete failed" },
        },
      },
    },

    // ─── SONGS ───
    "/song/uploadSong": {
      post: {
        tags: ["Songs"],
        summary: "Upload a new song",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["audio"],
                properties: {
                  title: { type: "string", example: "My Song" },
                  cover: { type: "string", format: "binary" },
                  audio: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Song uploaded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        songId: { type: "integer" },
                        title: { type: "string" },
                        totalUploads: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "Audio file required" },
        },
      },
    },
    "/song/getAllUploadSong": {
      get: {
        tags: ["Songs"],
        summary: "Get all songs (paginated, searchable)",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
        ],
        responses: {
          200: { description: "Songs list" },
        },
      },
    },
    "/song/getByIdSong": {
      get: {
        tags: ["Songs"],
        summary: "Get song by ID",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Song details" },
          404: { description: "Song not found" },
        },
      },
    },
    "/song/updateSong": {
      put: {
        tags: ["Songs"],
        summary: "Update a song",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  cover: { type: "string", format: "binary" },
                  audio: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Song updated" },
          404: { description: "Song not found" },
        },
      },
    },
    "/song/deleteSong": {
      delete: {
        tags: ["Songs"],
        summary: "Delete a song",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Song deleted" },
          404: { description: "Song not found" },
        },
      },
    },
    "/song/getSongsByArtist": {
      get: {
        tags: ["Songs"],
        summary: "Get songs by artist name",
        parameters: [
          {
            name: "artistName",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Artist songs" },
          404: { description: "Artist not found" },
        },
      },
    },
    "/song/getSongsByUserId": {
      get: {
        tags: ["Songs"],
        summary: "Get songs by user ID",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "User songs" },
          404: { description: "Artist not found" },
        },
      },
    },
    "/song/searchDashboard": {
      get: {
        tags: ["Songs"],
        summary: "Get search dashboard data (top songs, recent, artists)",
        responses: {
          200: { description: "Dashboard data" },
        },
      },
    },
    "/song/search": {
      get: {
        tags: ["Songs"],
        summary: "Search songs and artists",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: { type: "string", minLength: 2 },
            description: "Search query (min 2 characters)",
          },
        ],
        responses: {
          200: {
            description: "Search results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        songs: { type: "array", items: { $ref: "#/components/schemas/Song" } },
                        artists: { type: "array", items: { type: "object" } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/song/stream": {
      post: {
        tags: ["Songs"],
        summary: "Increment stream count for a song",
        description: "Call this when a user listens to a song for 30+ seconds. Creates a stream record for monthly tracking and increments the song's total stream count.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["songId"],
                properties: {
                  songId: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Stream counted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Stream counted successfully" },
                    data: {
                      type: "object",
                      properties: {
                        streamCount: { type: "integer", example: 42 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "songId is required" },
          404: { description: "Song not found" },
        },
      },
    },

    // ─── PLAYLISTS ───
    "/playList/addPlaylist": {
      post: {
        tags: ["Playlists"],
        summary: "Create a new playlist",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "My Playlist" },
                  playlistCover: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Playlist created" },
          400: { description: "Name required" },
        },
      },
    },
    "/playlist/getAllPlayList": {
      get: {
        tags: ["Playlists"],
        summary: "Get all playlists for current user",
        responses: {
          200: { description: "Playlists list" },
        },
      },
    },
    "/playList/sharePlaylist": {
      get: {
        tags: ["Playlists"],
        summary: "Get share link for a playlist",
        parameters: [
          {
            name: "playlistId",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Share URL",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        shareUrl: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ─── PLAYLIST SONGS ───
    "/playListSong/addPlaylistSong": {
      post: {
        tags: ["Playlist Songs"],
        summary: "Add a song to a playlist",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["playlistId", "songId"],
                properties: {
                  playlistId: { type: "integer", example: 1 },
                  songId: { type: "integer", example: 5 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Song added to playlist" },
          400: { description: "Missing required fields" },
        },
      },
    },
    "/playListSong/getAllSongsByPlaylist": {
      get: {
        tags: ["Playlist Songs"],
        summary: "Get all songs in a playlist",
        parameters: [
          {
            name: "playlistId",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Songs in playlist" },
          400: { description: "playlistId required" },
        },
      },
    },
    "/playListSong/removeSong": {
      delete: {
        tags: ["Playlist Songs"],
        summary: "Remove a song from a playlist",
        parameters: [
          {
            name: "playlistId",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "songId",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Song removed" },
          404: { description: "Song not found in playlist" },
        },
      },
    },

    // ─── ADMIN ───
    "/admin/getAllAdminDashboard": {
      get: {
        tags: ["Admin"],
        summary: "Get admin dashboard stats",
        responses: {
          200: { description: "Dashboard statistics" },
        },
      },
    },
    "/admin/getAllSubscribers": {
      get: {
        tags: ["Admin"],
        summary: "Get all subscribers",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Subscribers list" },
        },
      },
    },
    "/admin/getAllUploadedSongs": {
      get: {
        tags: ["Admin"],
        summary: "Get all uploaded songs (admin view)",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "All songs with total count" },
        },
      },
    },
    "/admin/deleteSong": {
      delete: {
        tags: ["Admin"],
        summary: "Delete a song (admin)",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Song deleted" },
        },
      },
    },
    "/admin/getArtistStreams": {
      get: {
        tags: ["Admin"],
        summary: "Get artist streams and payout data",
        responses: {
          200: { description: "Artist streams data" },
        },
      },
    },
    "/admin/getMonthlyStreams": {
      get: {
        tags: ["Admin"],
        summary: "Get monthly streams per artist for payouts",
        description: "Returns per-artist stream counts for a given month with per-song breakdown. Defaults to current month if no params provided.",
        parameters: [
          {
            name: "month",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 12, example: 3 },
            description: "Month number (1-12). Defaults to current month.",
          },
          {
            name: "year",
            in: "query",
            schema: { type: "integer", example: 2026 },
            description: "Year. Defaults to current year.",
          },
        ],
        responses: {
          200: {
            description: "Monthly streams data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        month: { type: "integer", example: 3 },
                        year: { type: "integer", example: 2026 },
                        artists: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              artistId: { type: "integer" },
                              artistName: { type: "string" },
                              paypalEmail: { type: "string", nullable: true },
                              monthlyStreams: { type: "integer" },
                              songs: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    songId: { type: "integer" },
                                    title: { type: "string" },
                                    streams: { type: "integer" },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/admin/exportArtistStreamsCsv": {
      get: {
        tags: ["Admin"],
        summary: "Export artist streams as CSV",
        responses: {
          200: {
            description: "CSV file download",
            content: {
              "text/csv": {
                schema: { type: "string" },
              },
            },
          },
        },
      },
    },

    // ─── CONTACT ───
    "/contact/sendMessage": {
      post: {
        tags: ["Contact"],
        summary: "Send a contact message",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "message"],
                properties: {
                  email: { type: "string", example: "user@example.com" },
                  message: {
                    type: "string",
                    minLength: 5,
                    maxLength: 2000,
                    example: "I have a question about...",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Message sent successfully" },
          400: { description: "Validation error" },
        },
      },
    },

    // ─── PUBLIC ───
    "/public/getLandingPageSong": {
      get: {
        tags: ["Public"],
        summary: "Get landing page data (no auth required)",
        security: [],
        responses: {
          200: { description: "Landing page songs and data" },
        },
      },
    },
  },
};

// Basic auth middleware for Swagger
function swaggerAuth(req, res, next) {
  const user = basicAuth(req);
  const validUser = process.env.SWAGGER_USERNAME || "parveen";
  const validPass = process.env.SWAGGER_PASSWORD || "Ace@12345";

  if (!user || user.name !== validUser || user.pass !== validPass) {
    res.set("WWW-Authenticate", 'Basic realm="Swagger Docs"');
    return res.status(401).send("Authentication required");
  }
  next();
}

function setupSwagger(app) {
  app.use(
    "/api-docs",
    swaggerAuth,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Audacity Music API Docs",
    })
  );
}

module.exports = setupSwagger;
