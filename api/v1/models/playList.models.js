module.exports = (sequelize, DataTypes) => {
  const Playlist = sequelize.define(
    'Playlist',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      coverUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'Playlists',
    }
  );

  return Playlist;
};


