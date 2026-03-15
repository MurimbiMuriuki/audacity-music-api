var commonHelper = require("../helper/common.helper");
const logger = require("../../../config/winston");
const db = require("../models");
const { Op, fn, col, where } = require("sequelize");
module.exports = {

    async createPlaylistSong(postData) {
        try {
            const playlistSong = await db.playlistSongObj.create(postData);
            return playlistSong;
        } catch (error) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(error));
            throw error;
        }
    },

    async getAllSongsByPlaylist(playlistId) {
        try {

            const songs = await db.playlistSongObj.findAll({
                where: { playlistId },
                include: [
                    {
                        model: db.playlistObj,
                        as: "playlist",

                    },
                    {
                        model: db.songObj,
                        as: "song",
                        attributes: ["id", "userId", "title", "coverUrl", "audioUrl"],
                        include: [{
                            model: db.usersObj,
                            as: "user",
                            attributes: ["id", "name", "artistName", "profileImage"],
                        }],
                    },
                ],
            });

            return songs;
        } catch (error) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(error));
            throw error;
        }
    },

    async removeSong(playlistId, songId) {
        try {
            const deleted = await db.playlistSongObj.destroy({
                where: { playlistId, songId }
            });
            return deleted;
        } catch (error) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(error));
            throw error;
        }
    },
}

