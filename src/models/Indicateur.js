module.exports = (sequelize, DataTypes) => {
  const Indicateur = sequelize.define('Indicateur', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    valeur: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  }, {
    tableName: 'Indicateur',
    timestamps: false,
  });

  Indicateur.associate = (db) => {
    Indicateur.belongsTo(db.Patient, {
      foreignKey: { name: 'PatientId', type: DataTypes.BIGINT, allowNull: false },
      onDelete: 'CASCADE',
    });
  };

  return Indicateur;
};
