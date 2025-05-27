module.exports = (sequelize, DataTypes) => {
  const Medecin = sequelize.define('Medecin', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    specialite: {
      type: DataTypes.ENUM('Diabète', 'Hypertension', 'Cholesterol'),
      allowNull: false,
    },
    numeroIdentification: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'Medecin',
    timestamps: false,
  });

  Medecin.associate = (db) => {
    Medecin.belongsTo(db.User, {
      foreignKey: { name: 'UserId', type: DataTypes.BIGINT, allowNull: false },
      onDelete: 'CASCADE',
    });
  };

  return Medecin;
};
