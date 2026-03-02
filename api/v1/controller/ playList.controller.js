require("dotenv").config();
var commonHelper = require("../helper/common.helper");
var bcrypt = require("bcryptjs");
const config = require("../../../config/db.config");
var jwt = require("jsonwebtoken");
const playListService = require("../services/playList.service");
const { check, validationResult } = require("express-validator"); // Updated import
const myValidationResult = validationResult.withDefaults({
    formatter: (error) => {
        return error.msg;
    },
});


module.exports = {

    async addPlaylist(req, res) {
        try {
            const { userId, name } = req.body;

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
            const { userId } = req.query;

            const data = await playListService.getAllPlayList(userId);

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
    }


}


