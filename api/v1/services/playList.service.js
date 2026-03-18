var commonHelper = require("../helper/common.helper");
const logger = require("../../../config/winston");
const db = require("../models");
const { Op, fn, col, where } = require("sequelize");
module.exports = {
    async createPlaylist(data) {
        try {
            const playlist = await db.playlistObj.create(data);
            return playlist;
        } catch (error) {
            logger.error("createPlaylist error:", error);
            throw error;
        }
    },

    async getAllPlayList(userId) {
        try {
            const playlists = await db.playlistObj.findAll({
                where: { userId },
                include: [
                    {
                        model: db.playlistSongObj,
                        as: "playlistSongs",
                        attributes: ["id"],
                    }
                ],
                order: [["createdAt", "DESC"]],
            });

            const formattedData = playlists.map(pl => {
                const plain = pl.toJSON();
                return {
                    ...plain,
                    songCount: plain.playlistSongs ? plain.playlistSongs.length : 0,
                    playlistSongs: undefined,
                };
            });

            return formattedData;

        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    }

}

