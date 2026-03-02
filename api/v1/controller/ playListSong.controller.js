require("dotenv").config();
var commonHelper = require("../helper/common.helper");
var bcrypt = require("bcryptjs");
const config = require("../../../config/db.config");
var jwt = require("jsonwebtoken");
const playListSongService = require("../services/playListSong.service");
const { check, validationResult } = require("express-validator"); // Updated import
const myValidationResult = validationResult.withDefaults({
    formatter: (error) => {
        return error.msg;
    },
});


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



}


