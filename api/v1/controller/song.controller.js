const songServices = require("../services/song.service");


module.exports = {

    async uploadSong(req, res) {
        try {
            const { userId, artistName, title } = req.body;

            if (!req.files || !req.files.audio) {
                return res.status(400).json({
                    success: false,
                    message: "Audio file is required",
                });
            }

            const coverFile = req.files.cover ? req.files.cover[0].filename : null;
            const audioFile = req.files.audio[0].filename;

            const data = {
                userId,
                artistName,
                title,
                coverUrl: coverFile ? `/uploads/covers/${coverFile}` : null,
                audioUrl: `/uploads/audios/${audioFile}`,
            };

            const song = await songServices.createSong(data);

            const totalUploads = await songServices.getUserSongCount(userId);

            res.status(201).json({
                success: true,
                message: "Song uploaded successfully",
                data: {
                    songId: song.id,
                    title: song.title,
                    totalUploads: totalUploads
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error",
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
            const { artistName, title } = req.body;

            let updateData = {
                artistName,
                title
            };

            // If new cover uploaded
            if (req.files && req.files.cover) {
                const coverFile = req.files.cover[0].filename;
                updateData.coverUrl = `/uploads/covers/${coverFile}`;
            }

            // If new audio uploaded
            if (req.files && req.files.audio) {
                const audioFile = req.files.audio[0].filename;
                updateData.audioUrl = `/uploads/audios/${audioFile}`;
            }

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


