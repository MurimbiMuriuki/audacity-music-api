var commonHelper = require("../helper/common.helper");
const logger = require("../../../config/winston");
const db = require("../models");
const { Op, fn, col, where } = require("sequelize");
const fs = require("fs");
const path = require("path");

const userInclude = {
    model: db.usersObj,
    as: "user",
    attributes: ["id", "name", "artistName", "profileImage"],
};

module.exports = {


    async getDashboardStats() {
        try {

            const totalSubscribers = await db.usersObj.count({
                where: { status: 1 }
            });

            const totalSongs = await db.songObj.count();

            const totalRevenueData = await db.subscriptionObj.findAll({

            });
            const totalRevenue = totalRevenueData[0]?.dataValues.totalRevenue || 0;


            const totalStreamsData = await db.songObj.findAll({
                attributes: [
                    [fn("SUM", col("streamCount")), "totalStreams"]
                ],
            });
            const totalStreams = totalStreamsData[0]?.dataValues.totalStreams || 0;

            return {
                totalSubscribers,
                totalSongs,
                totalRevenue,
                totalStreams
            };
        } catch (error) {
            throw error;
        }

    },

    async fetchSubscribers(search) {
        try {
            const whereCondition = {};


            if (search) {
                whereCondition[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ];
            }

            const subscribers = await db.usersObj.findAll({
                where: whereCondition,
                include: [
                {
                    model: db.subscriptionObj,
                    as: "subscription",
                    required: false,
                },
            ],
                order: [["createdAt", "DESC"]],
            });

            return subscribers;
        } catch (error) {
            throw error;
        }
    },

    async fetchAllSongs(search) {
        const whereCondition = {};

        if (search) {
            whereCondition[db.Sequelize.Op.or] = [
                { title: { [db.Sequelize.Op.like]: `%${search}%` } },
                { "$user.artistName$": { [db.Sequelize.Op.like]: `%${search}%` } },
                { "$user.name$": { [db.Sequelize.Op.like]: `%${search}%` } }
            ];
        }

        const songs = await db.songObj.findAll({
            where: whereCondition,
            include: [userInclude],
            order: [["createdAt", "DESC"]],
            subQuery: false,
        });


        const formattedSongs = songs.map((song) => {
            const audioExt = path.extname(song.audioUrl || "").replace(".", "").toUpperCase();
            let fileSize = 0;
            try {
                const audioPath = path.join(__dirname, "../../", song.audioUrl);
                const stats = fs.statSync(audioPath);
                fileSize = stats.size; // in bytes
            } catch (e) {
                fileSize = 0;
            }

            return {
                id: song.id,
                artistName: song.user?.artistName || song.user?.name || null,
                title: song.title,
                format: audioExt,
                fileSize, // bytes
                coverUrl: song.coverUrl,
                audioUrl: song.audioUrl,
                streamCount: song.streamCount,
                createdAt: song.createdAt,
            };
        });

        return formattedSongs;
    },

    async removeSong(id) {
        const song = await db.songObj.findByPk(id);
        if (!song) throw new Error("Song not found");


        if (song.audioUrl) {
            const audioPath = path.join(__dirname, "../../", song.audioUrl);
            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
        }
        if (song.coverUrl) {
            const coverPath = path.join(__dirname, "../../", song.coverUrl);
            if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
        }


        await db.songObj.destroy({ where: { id } });

        return true;
    },

     async fetchArtistStreams() {
        try {
            // Get all users who have songs
            const artists = await db.usersObj.findAll({
                attributes: [
                    "id", "name", "artistName",
                    [fn("SUM", col("songs.streamCount")), "totalStreams"]
                ],
                include: [{
                    model: db.songObj,
                    as: "songs",
                    attributes: [],
                    required: true,
                }],
                group: ["users.id"],
                subQuery: false,
            });

            // Get current month boundaries
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            const artistStats = await Promise.all(
                artists.map(async (artist) => {
                    // Get monthly streams from SongStreams table
                    const monthlyStreams = await db.songStreamObj.count({
                        include: [{
                            model: db.songObj,
                            as: "song",
                            attributes: [],
                            where: { userId: artist.id },
                        }],
                        where: {
                            createdAt: { [Op.between]: [monthStart, monthEnd] }
                        },
                    });

                    const paypalEmail = artist.paypalEmail || null;

                    return {
                        artistId: artist.id,
                        artistName: artist.artistName || artist.name,
                        totalStreams: parseInt(artist.get("totalStreams") || 0),
                        monthlyStreams: monthlyStreams || 0,
                        paypalEmail,
                    };
                })
            );

            return artistStats;
        } catch (error) {
            throw error;
        }
    },

    async fetchMonthlyStreams(month, year) {
        try {
            const monthStart = new Date(year, month - 1, 1);
            const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

            // Get per-artist streams for the given month
            const artists = await db.usersObj.findAll({
                attributes: [
                    "id", "name", "artistName", "paypalEmail",
                ],
                include: [{
                    model: db.songObj,
                    as: "songs",
                    attributes: [],
                    required: true,
                }],
                group: ["users.id"],
                subQuery: false,
            });

            const result = await Promise.all(
                artists.map(async (artist) => {
                    // Count streams for this artist's songs in the given month
                    const monthlyStreams = await db.songStreamObj.count({
                        include: [{
                            model: db.songObj,
                            as: "song",
                            attributes: [],
                            where: { userId: artist.id },
                        }],
                        where: {
                            createdAt: { [Op.between]: [monthStart, monthEnd] }
                        },
                    });

                    // Per-song breakdown
                    const songStreams = await db.songStreamObj.findAll({
                        attributes: [
                            "songId",
                            [fn("COUNT", col("SongStream.id")), "streams"],
                        ],
                        include: [{
                            model: db.songObj,
                            as: "song",
                            attributes: ["title"],
                            where: { userId: artist.id },
                        }],
                        where: {
                            createdAt: { [Op.between]: [monthStart, monthEnd] }
                        },
                        group: ["songId"],
                    });

                    const songs = songStreams.map(s => ({
                        songId: s.songId,
                        title: s.song?.title,
                        streams: parseInt(s.get("streams") || 0),
                    }));

                    return {
                        artistId: artist.id,
                        artistName: artist.artistName || artist.name,
                        paypalEmail: artist.paypalEmail || null,
                        monthlyStreams,
                        songs,
                    };
                })
            );

            // Filter out artists with 0 streams
            return result.filter(a => a.monthlyStreams > 0);
        } catch (error) {
            throw error;
        }
    }


}
