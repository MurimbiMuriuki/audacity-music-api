var commonHelper = require("../helper/common.helper");
const logger = require("../../../config/winston");
const db = require("../models");
const { Op, fn, col, where } = require("sequelize");

const userInclude = {
    model: db.usersObj,
    as: "user",
    attributes: ["id", "name", "artistName", "profileImage"],
};

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

    async getAllUploadSong(search, page = 1, limit = 10, shuffle = false, seed = null) {
        try {
            let condition = {};
            const offset = (page - 1) * limit;

            if (search) {
                condition = {
                    [db.Op.or]: [
                        {
                            title: {
                                [db.Op.like]: `%${search}%`
                            }
                        },
                        {
                            "$user.artistName$": {
                                [db.Op.like]: `%${search}%`
                            }
                        },
                        {
                            "$user.name$": {
                                [db.Op.like]: `%${search}%`
                            }
                        }
                    ]
                };
            }

            const orderClause = shuffle && seed != null
                ? [db.Sequelize.literal(`RAND(${parseInt(seed, 10)})`)]
                : [["createdAt", "DESC"]];

            const { count, rows } = await db.songObj.findAndCountAll({
                where: condition,
                include: [userInclude],
                order: orderClause,
                limit,
                offset,
                subQuery: false,
            });

            const songs = rows.map(song => {
                const plain = song.toJSON();
                plain.artistName = plain.user?.artistName || plain.user?.name || null;
                return plain;
            });

            return { total: count, page, totalPages: Math.ceil(count / limit), songs };
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    async getByIdSong(id) {
        try {
            const song = await db.songObj.findOne({
                where: { id: id },
                include: [userInclude],
            });

            if (song) {
                const plain = song.toJSON();
                plain.artistName = plain.user?.artistName || plain.user?.name || null;
                return plain;
            }

            return song;
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    async deleteSong(id) {
        try {
            await db.playlistSongObj.destroy({
                where: { songId: id }
            });

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
    async getSongsByArtist(artistName, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            // Find users matching the artistName
            const user = await db.usersObj.findOne({
                where: {
                    [db.Op.or]: [
                        { artistName: artistName },
                        { name: artistName },
                    ]
                }
            });

            if (!user) return null;

            const { count, rows } = await db.songObj.findAndCountAll({
                where: { userId: user.id },
                include: [userInclude],
                order: [["createdAt", "DESC"]],
                limit,
                offset
            });

            const songs = rows.map(song => {
                const plain = song.toJSON();
                plain.artistName = plain.user?.artistName || plain.user?.name || null;
                return plain;
            });

            return {
                artistId: user.id,
                artistName: user.artistName || user.name,
                profileImage: user.profileImage,
                songCount: count,
                page,
                totalPages: Math.ceil(count / limit),
                songs
            };

        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },

    async getSongsByUserId(userId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            const user = await db.usersObj.findByPk(userId, {
                attributes: ["id", "name", "artistName", "profileImage"],
            });

            if (!user) return null;

            const { count, rows } = await db.songObj.findAndCountAll({
                where: { userId },
                include: [userInclude],
                order: [["createdAt", "DESC"]],
                limit,
                offset,
            });

            const songs = rows.map(song => {
                const plain = song.toJSON();
                plain.artistName = plain.user?.artistName || plain.user?.name || null;
                return plain;
            });

            return {
                artistId: user.id,
                artistName: user.artistName || user.name,
                profileImage: user.profileImage,
                songCount: count,
                page,
                totalPages: Math.ceil(count / limit),
                songs,
            };
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    async searchDashboard() {
        try {
            // Trending artists (based on total streams per user)
            const trendingArtists = await db.usersObj.findAll({
                attributes: [
                    "id", "name", "artistName",
                    [db.Sequelize.fn("SUM", db.Sequelize.col("songs.streamCount")), "totalStreams"]
                ],
                include: [{
                    model: db.songObj,
                    as: "songs",
                    attributes: [],
                    required: true,
                }],
                group: ["users.id"],
                order: [[db.Sequelize.literal("totalStreams"), "DESC"]],
                limit: 5,
                subQuery: false,
            });

            const formatted = trendingArtists.map(a => ({
                artistName: a.artistName || a.name,
                totalStreams: a.get("totalStreams"),
            }));

            // Recent searches (static for now)
            const recentSearches = [];

            return {
                recentSearches,
                trendingArtists: formatted
            };

        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },

    async searchSongsAndArtists(query, limit = 10) {
        try {
            // Search songs by title, include user for artistName
            const songs = await db.songObj.findAll({
                where: {
                    [db.Op.or]: [
                        { title: { [db.Op.like]: `%${query}%` } },
                        { "$user.artistName$": { [db.Op.like]: `%${query}%` } },
                        { "$user.name$": { [db.Op.like]: `%${query}%` } },
                    ],
                },
                include: [userInclude],
                order: [["createdAt", "DESC"]],
                limit,
                subQuery: false,
            });

            const formattedSongs = songs.map(song => {
                const plain = song.toJSON();
                plain.artistName = plain.user?.artistName || plain.user?.name || null;
                return plain;
            });

            // Search artists (users who have songs matching query)
            const artists = await db.usersObj.findAll({
                attributes: [
                    "id", "name", "artistName", "profileImage",
                    [db.Sequelize.fn("COUNT", db.Sequelize.col("songs.id")), "songCount"],
                ],
                include: [{
                    model: db.songObj,
                    as: "songs",
                    attributes: [],
                    required: true,
                }],
                where: {
                    [db.Op.or]: [
                        { name: { [db.Op.like]: `%${query}%` } },
                        { artistName: { [db.Op.like]: `%${query}%` } },
                    ],
                },
                group: ["users.id"],
                limit,
                subQuery: false,
            });

            const formattedArtists = artists.map(a => {
                const plain = a.toJSON();
                plain.artistName = plain.artistName || plain.name;
                return plain;
            });

            return { songs: formattedSongs, artists: formattedArtists };
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

    async incrementStream(songId, userId) {
        try {
            const song = await db.songObj.findByPk(songId);
            if (!song) return null;

            // Create stream record for monthly tracking
            await db.songStreamObj.create({ songId, userId });

            // Increment the streamCount on the song
            await db.songObj.increment("streamCount", { where: { id: songId } });

            return { streamCount: song.streamCount + 1 };
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },

    async fetchLandingPageData() {
        try {
            const featuredSongs = await db.songObj.findAll({
                attributes: ["id", "title", "coverUrl", "audioUrl"],
                include: [userInclude],
                order: [["createdAt", "DESC"]],
                limit: 2,
            });

            return featuredSongs.map(song => {
                const plain = song.toJSON();
                plain.artistName = plain.user?.artistName || plain.user?.name || null;
                return plain;
            });
        } catch (error) {
            throw error;
        }
    }

}
