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
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

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

            const artistStats = await Promise.all(
                artists.map(async (artist) => {
                    const last30DaysStreams = await db.songObj.sum("streamCount", {
                        where: {
                            userId: artist.id,
                            createdAt: { [Op.gte]: thirtyDaysAgo }
                        }
                    });

                    const subscription = await db.subscriptionObj.findOne({
                        where: { user_id: artist.id }
                    });
                    const paypalEmail = subscription ? subscription.paypalEmail : null;

                    return {
                        artistName: artist.artistName || artist.name,
                        totalStreams: parseInt(artist.get("totalStreams") || 0),
                        last30DaysStreams: last30DaysStreams || 0,
                        paypalEmail,
                    };
                })
            );

            return artistStats;
        } catch (error) {
            throw error;
        }
    }


}
