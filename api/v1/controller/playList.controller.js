const playListService = require("../services/playList.service");


module.exports = {

    async addPlaylist(req, res) {
        try {
            const userId = req.userId;
            const { name } = req.body;

            if (!userId || !name) {
                return res.status(400).json({
                    success: false,
                    message: "userId and name are required",
                });
            }

            const coverFile = req.file ? `/uploads/playlists/${req.file.filename}` : null;

            const playlistData = {
                userId,
                name,
                coverUrl: coverFile,
            };

            const playlist = await playListService.createPlaylist(playlistData);

            res.status(201).json({
                success: true,
                message: "Playlist created successfully",
                data: playlist,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },

    async getAllPlayList(req, res) {
        try {
            const data = await playListService.getAllPlayList();

            res.status(200).json({
                success: true,
                message: "Playlists fetched successfully",
                data: data,
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },
    async deletePlaylist(req, res) {
        try {
            const { playlistId } = req.query;
            const userId = req.userId;

            if (!playlistId) {
                return res.status(400).json({
                    success: false,
                    message: "playlistId is required",
                });
            }

            const deleted = await playListService.deletePlaylist(playlistId, userId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Playlist not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Playlist deleted successfully",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },

    async sharePlaylist(req, res) {
        try {
            const { playlistId } = req.query;

            res.status(200).json({
                success: true,
                message: "Playlist share link",
                data: {
                    shareUrl: `${process.env.APP_URL}/playlist/share/${playlistId}`
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },


}


