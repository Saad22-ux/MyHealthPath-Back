module.exports = (sequelize, DataTypes) => { 
  const Indicateur = sequelize.define('Indicateur', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    tableName: 'Indicateur',
    timestamps: false,
  });

  Indicateur.associate = (db) => {
    Indicateur.belongsTo(db.Patient, {
      foreignKey: { name: 'PatientId', allowNull: false },
      onDelete: 'CASCADE',
    });
    Indicateur.belongsTo(db.Prescription, {
      foreignKey: { name: 'PrescriptionId', allowNull: false },
      onDelete: 'CASCADE',
    });

    Indicateur.hasMany(db.SuiviIndicateur, {
      foreignKey: 'IndicateurId'
    });
  };

  return Indicateur;
};
