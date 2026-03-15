const config = require("../../../config/db.config");
const { Sequelize, Op } = require("sequelize");

const dbObj = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  
  port: process.env.DB_PORT,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.dbObj = dbObj;
db.Op = Op;


db.usersObj = require("./user.models")(dbObj, Sequelize);
db.songObj = require("./song.models")(dbObj, Sequelize);
db.playlistObj = require("./playList.models")(dbObj, Sequelize);
db.playlistSongObj = require("./playListsSong.models")(dbObj, Sequelize);
db.subscriptionObj = require("./Subscription.models")(dbObj, Sequelize);




db.playlistSongObj.belongsTo(db.playlistObj, {
  foreignKey: "playlistId",
  as: "playlist"
});


db.playlistSongObj.belongsTo(db.songObj, {
  foreignKey: "songId",
  as: "song"
});


db.usersObj.hasMany(db.subscriptionObj, {
  foreignKey: "user_id",
  as: "subscription"
});

db.usersObj.hasMany(db.songObj, {
  foreignKey: "userId",
  as: "songs"
});

db.songObj.belongsTo(db.usersObj, {
  foreignKey: "userId",
  as: "user"
});



// dbObj.sync({ force: false });
module.exports = db;