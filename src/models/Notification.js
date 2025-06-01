module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('rappel', 'alerte'),
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.Patient);
  };

  return Notification;
};