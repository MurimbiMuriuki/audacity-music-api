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
      paystack_reference: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      paystack_customer_code: {
        type: DataTypes.STRING,
        allowNull: true
      },
      paystack_subscription_code: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      paystack_email_token: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      }
    },
    {
      tableName: 'subscriptions',
      timestamps: false,
    }
  );

  return Subscription;
};
