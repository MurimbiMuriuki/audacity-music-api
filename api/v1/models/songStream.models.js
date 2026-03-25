module.exports = (sequelize, DataTypes) => {
  const SongStream = sequelize.define('SongStream', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    songId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

  }, {
    tableName: 'SongStreams',
  });

  return SongStream;
};
