module.exports = (sequelize, DataTypes) => {
  const Prescription = sequelize.define('Prescription', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'Prescription',
    timestamps: false,
  });

  Prescription.associate = (db) => {
    Prescription.belongsTo(db.Medecin, {
      foreignKey: { name: 'MedecinId', type: DataTypes.BIGINT, allowNull: false },
      onDelete: 'CASCADE',
    });
    Prescription.belongsTo(db.Patient, {
      foreignKey: { name: 'PatientId', type: DataTypes.BIGINT, allowNull: false },
      onDelete: 'CASCADE',
    });
    Prescription.hasMany(db.Medicament, {
      foreignKey: 'PrescriptionId',
      as: 'medicaments',
      onDelete: 'CASCADE',
      hooks: true
    });
    Prescription.hasMany(db.Indicateur, {
      foreignKey: 'PrescriptionId',
      as: 'indicateurs',
      onDelete: 'CASCADE',
      hooks: true
    });
  };

  return Prescription;
};
