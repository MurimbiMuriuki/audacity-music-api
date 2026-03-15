module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      provider: {
        type: DataTypes.ENUM('google', 'apple'),
        allowNull: true,
      },

      provider_id: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },

      role: {
        type: DataTypes.STRING(200),
        defaultValue: 'user',
      },

      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      artistName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      paypalEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return User;
};
