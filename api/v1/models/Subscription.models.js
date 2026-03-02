module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define(
    'subscription',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      plan_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      billing_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      tableName: 'subscriptions',
      timestamps: false,
    }
  );

  return Subscription;
};
