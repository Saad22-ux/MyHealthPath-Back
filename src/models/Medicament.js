module.exports = (sequelize, DataTypes) => {
  const Medicament = sequelize.define('Medicament', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dose: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    frequency: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    duree: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  }, {
    tableName: 'Medicament',
    timestamps: false,
  });

  Medicament.associate = (db) => {
    Medicament.belongsTo(db.Patient, {
      foreignKey: { name: 'PatientId', type: DataTypes.BIGINT, allowNull: false },
      onDelete: 'CASCADE',
    });

    Medicament.belongsTo(db.Prescription, {
      foreignKey: { name: 'PrescriptionId', type: DataTypes.BIGINT, allowNull: true },
      onDelete: 'CASCADE',
    });
    
  };

  return Medicament;
};
