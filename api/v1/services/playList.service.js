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
                // include: [
                //     {
                //         model: db.songObj,
                //         through: { attributes: [] }, // hide join table
                //         attributes: ["id"], // only need id for count
                //     }
                // ],
                order: [["createdAt", "DESC"]],
            });

            // Add song count
            // const formattedData = playlists.map(pl => {
            //     return {
            //         id: pl.id,
            //         userId: pl.userId,
            //         name: pl.name,
            //         coverUrl: pl.coverUrl,
            //         songCount: pl.Songs.length
            //     };
            // });

            return playlists;

        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    }

}

