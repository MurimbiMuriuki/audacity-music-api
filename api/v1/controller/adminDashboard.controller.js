require("dotenv").config();
var commonHelper = require("../helper/common.helper");
var bcrypt = require("bcryptjs");
const config = require("../../../config/db.config");
var jwt = require("jsonwebtoken");
const adminDashboardService = require("../services/adminDashboard.services");
const { check, validationResult } = require("express-validator"); 
const myValidationResult = validationResult.withDefaults({
    formatter: (error) => {
        return error.msg;
    },
});
const { Parser } = require("json2csv");

module.exports = {

    async getAllAdminDashboard(req, res) {
        try {

            const dashboardStats = await adminDashboardService.getDashboardStats();

            res.status(200).json({
                success: true,
                message: "Admin dashboard stats fetched successfully",
                data: dashboardStats,
            });
        } catch (error) {
            console.error("Dashboard Error:", error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },


    async getAllSubscribers(req, res) {
        try {

            const { search } = req.query;

            const subscribers = await adminDashboardService.fetchSubscribers(search);

            res.status(200).json({
                success: true,
                message: "Subscribers fetched successfully",
                data: subscribers,
            });
        } catch (error) {
            console.error("Subscribers Error:", error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },

    async getAllUploadedSongs(req, res) {
        try {
            const search = req.query.search || "";
            const songs = await adminDashboardService.fetchAllSongs(search);

            const totalUploads = songs.length;

            res.status(200).json({
                success: true,
                totalUploads,
                data: songs,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },


    async deleteSong(req, res) {
        try {
            const { id } = req.query;

            const result = await adminDashboardService.removeSong(id);

            res.status(200).json({
                success: true,
                message: "Song deleted successfully",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },
    async getArtistStreams(req, res) {
        try {
            const streams = await adminDashboardService.fetchArtistStreams();

            res.status(200).json({
                success: true,
                data: streams,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    },

    async exportArtistStreamsCsv(req, res) {
        try {
            const streams = await adminDashboardService.fetchArtistStreams();

            const fields = ["artistName", "totalStreams", "last30DaysStreams", "paypalEmail"];
            const opts = { fields };
            const parser = new Parser(opts);
            const csv = parser.parse(streams);

            res.header("Content-Type", "text/csv");
            res.attachment("artist_payouts.csv");
            res.send(csv);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "CSV export failed",
            });
        }
    }



}