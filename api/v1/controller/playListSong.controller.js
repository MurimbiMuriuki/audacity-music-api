const playListSongService = require("../services/playListSong.service");
const commonHelper = require("../helper/common.helper");
const logger = require("../../../config/winston");


module.exports = {


    async addPlaylistSong(req, res) {
        try {
            const { playlistId, songId } = req.body;

            if (!playlistId || !songId) {
                return res.status(400).json({
                    success: false,
                    message: "playlistId and songId are required",
                });
            }

            const data = { playlistId, songId };
            const playlistSong = await playListSongService.createPlaylistSong(data);

            res.status(201).json({
                success: true,
                message: "Song added to playlist successfully",
                data: playlistSong,
            });
        } catch (error) {
            console.error(error);
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(error));
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },

    async getAllSongsByPlaylist(req, res) {
        try {
            const { playlistId } = req.query;

            if (!playlistId) {
                return res.status(400).json({
                    success: false,
                    message: "playlistId is required",
                });
            }

            const songs = await playListSongService.getAllSongsByPlaylist(playlistId);

            res.status(200).json({
                success: true,
                message: "Songs fetched successfully",
                data: songs,
            });
        } catch (error) {
            console.error(error);
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(error));
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },

    async removeSong(req, res) {
        try {
            const { playlistId, songId } = req.query;

            if (!playlistId || !songId) {
                return res.status(400).json({
                    success: false,
                    message: "playlistId and songId are required",
                });
            }

            const deleted = await playListSongService.removeSong(playlistId, songId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Song not found in playlist",
                });
            }

            res.status(200).json({
                success: true,
                message: "Song removed from playlist successfully",
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },



}


