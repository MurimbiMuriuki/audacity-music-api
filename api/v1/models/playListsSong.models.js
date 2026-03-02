module.exports = (sequelize, DataTypes) => {
  const PlaylistSong = sequelize.define(
    'PlaylistSong',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      playlistId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      songId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'PlaylistSongs',
    }
  );

  return PlaylistSong;
};
