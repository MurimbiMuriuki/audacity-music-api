var commonHelper = require("../helper/common.helper");
const logger = require("../../../config/winston");
const db = require("../models");
const { Op, fn, col, where } = require("sequelize");
module.exports = {
    /*createSong*/
    async createSong(postData) {
        try {
            let song = await db.songObj.create(postData);
            return song;
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },

    async getAllUploadSong(search) {
        try {
            let condition = {};


            if (search) {
                condition = {
                    [db.Op.or]: [
                        {
                            artistName: {
                                [db.Op.like]: `%${search}%`
                            }
                        },
                        {
                            title: {
                                [db.Op.like]: `%${search}%`
                            }
                        }
                    ]
                };
            }

            const songs = await db.songObj.findAll({
                where: condition,
                order: [["createdAt", "DESC"]]
            });

            return songs;
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    async getByIdSong(id) {
        try {
            const song = await db.songObj.findOne({
                where: { id: id }
            });

            return song;
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    async deleteSong(id) {
        try {
            const deletedRow = await db.songObj.destroy({
                where: { id: id }
            });

            return deletedRow;
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    async updateSong(id, updateData) {
        try {
            const [updatedRow] = await db.songObj.update(updateData, {
                where: { id: id }
            });

            return updatedRow;
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    async getSongsByArtist(artistName) {
        try {
            const songs = await db.songObj.findAll({
                where: {
                    artistName: artistName
                },
                order: [["createdAt", "DESC"]]
            });

            return {
                artistName: artistName,
                songCount: songs.length,
                avatar: songs.cover,
                songs: songs
            };

        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    async searchDashboard() {
        try {
            // Trending artists (based on total streams)
            const trendingArtists = await db.songObj.findAll({
                attributes: [
                    "artistName",
                    [db.Sequelize.fn("SUM", db.Sequelize.col("streamCount")), "totalStreams"]
                ],
                group: ["artistName"],
                order: [[db.Sequelize.literal("totalStreams"), "DESC"]],
                limit: 5
            });

            // Recent searches (static for now)
            const recentSearches = [];

            return {
                recentSearches,
                trendingArtists
            };

        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    async getUserSongCount(userId) {
        try {
            const count = await db.songObj.count({
                where: { userId }
            });

            return count;

        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },

    async fetchLandingPageData() {
        try {
            // Get 2 client-provided songs (latest 2 uploaded)
            const featuredSongs = await db.songObj.findAll({
                attributes: ["id", "title", "artistName", "coverUrl", "audioUrl"],
                order: [["createdAt", "DESC"]],
                limit: 2,
            });

            return featuredSongs
            
                
            
        } catch (error) {
            throw error;
        }
    }

}

