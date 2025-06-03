module.exports = (sequelize, DataTypes) => {
  const Medecin = sequelize.define('Medecin', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    specialite: {
      type: DataTypes.ENUM('endocrinologie-diabétologie-nutrition', 'cardiologie', 'lipidologie'),
      allowNull: false,
    },
    numeroIdentification: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'Medecin',
    timestamps: true,
  });

  Medecin.associate = (db) => {
    Medecin.belongsTo(db.User, {
      foreignKey: { name: 'UserId', type: DataTypes.BIGINT, allowNull: false },
      onDelete: 'CASCADE',
    });
  };

  return Medecin;
};
