module.exports = (sequelize, DataTypes) => {
  const Song = sequelize.define('Song', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    artistName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    coverUrl: {
      type: DataTypes.STRING,
    },

    audioUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    streamCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }

  }, {
    tableName: 'Songs'
  });

  return Song;
};
