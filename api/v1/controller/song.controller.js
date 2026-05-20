const songServices = require("../services/song.service");
const { getAudioDurationFromBuffer } = require("../helper/audio.helper");
const { uploadToCloudinary } = require("../helper/cloudinary.helper");


module.exports = {

    async uploadSong(req, res) {
        try {
            const userId = req.userId;
            const { title, artistName } = req.body;

            if (!req.files || !req.files.audio) {
                return res.status(400).json({
                    success: false,
                    message: "Audio file is required",
                });
            }

            const audioFile = req.files.audio[0];
            const duration = await getAudioDurationFromBuffer(audioFile.buffer);

            const [audioUrl, coverUrl] = await Promise.all([
                uploadToCloudinary(audioFile),
                req.files.cover ? uploadToCloudinary(req.files.cover[0]) : Promise.resolve(null),
            ]);

            const data = {
                userId,
                title,
                artistName,
                coverUrl,
                audioUrl,
                duration,
            };

            const song = await songServices.createSong(data);
            const totalUploads = await songServices.getUserSongCount(userId);

            res.status(201).json({
                success: true,
                message: "Song uploaded successfully",
                data: {
                    songId: song.id,
                    title: song.title,
                    artistName_new: song.artistName,
                    totalUploads: totalUploads
                }
            });
        } catch (error) {
            console.error("uploadSong error:", error?.message || error);
            res.status(500).json({
                success: false,
                message: error?.message || "Server error",
            });
        }
    },
    async getAllUploadSong(req, res) {
        try {
            const { search } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await songServices.getAllUploadSong(search, page, limit);

            res.status(200).json({
                success: true,
                message: "Songs fetched successfully",
                data: result
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    },

    async getByIdSong(req, res) {
        try {
            const { id } = req.query;

            const song = await songServices.getByIdSong(id);

            if (!song) {
                return res.status(404).json({
                    success: false,
                    message: "Song not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Song fetched successfully",
                data: song
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    },
    async deleteSong(req, res) {
        try {
            const { id } = req.query;

            const deleted = await songServices.deleteSong(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Song not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Song deleted successfully"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    },
    async updateSong(req, res) {
        try {
            const { id } = req.query;
            const { title, artistName } = req.body;

            let updateData = {
                title,
                artistName
            };

            const uploads = [];

            if (req.files && req.files.cover) {
                uploads.push(
                    uploadToCloudinary(req.files.cover[0]).then(url => { updateData.coverUrl = url; })
                );
            }

            if (req.files && req.files.audio) {
                const audioFile = req.files.audio[0];
                const duration = await getAudioDurationFromBuffer(audioFile.buffer);
                if (duration !== null) {
                    updateData.duration = duration;
                }
                uploads.push(
                    uploadToCloudinary(audioFile).then(url => { updateData.audioUrl = url; })
                );
            }

            await Promise.all(uploads);

            const updated = await songServices.updateSong(id, updateData);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: "Song not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Song updated successfully"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    },

    async getSongsByArtist(req, res) {
        try {
            const { artistName } = req.query;

            const result = await songServices.getSongsByArtist(artistName);

            if (!result || result.songs.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Artist not found or no songs available"
                });
            }

            res.status(200).json({
                success: true,
                message: "Artist songs fetched successfully",
                data: result
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    },

    async getSongsByUserId(req, res) {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "userId is required",
                });
            }

            const result = await songServices.getSongsByUserId(userId);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Artist not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Artist songs fetched successfully",
                data: result,
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    },
    async searchDashboard(req, res) {
        try {
            const data = await songServices.searchDashboard();

            res.status(200).json({
                success: true,
                message: "Search dashboard data",
                data
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    },

    async search(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim().length < 2) {
                return res.status(200).json({
                    success: true,
                    message: "Search results",
                    data: { songs: [], artists: [] },
                });
            }

            const data = await songServices.searchSongsAndArtists(q.trim());

            res.status(200).json({
                success: true,
                message: "Search results",
                data,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },

    async incrementStream(req, res) {
        try {
            const { songId } = req.body;
            const userId = req.userId;

            if (!songId) {
                return res.status(400).json({
                    success: false,
                    message: "songId is required",
                });
            }

            const result = await songServices.incrementStream(songId, userId);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Song not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Stream counted successfully",
                data: result,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },

    async getHomeFeed(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const cap = Math.min(limit, 200);

            const songs = await songServices.getHomeFeed(cap);

            res.status(200).json({
                success: true,
                message: "Home feed fetched successfully",
                data: {
                    total: songs.length,
                    songs,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },

    async getLandingPageSong(req, res) {
        try {
            const data = await songServices.fetchLandingPageData();

            res.status(200).json({
                success: true,
                message: "Landing page data fetched successfully",
                data,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    }
}
