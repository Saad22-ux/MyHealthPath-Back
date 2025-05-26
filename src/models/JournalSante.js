module.exports = (sequelize, DataTypes) => {
  const JournalSante = sequelize.define('JournalSante', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    PrescriptionId: {    // Add this
      type: DataTypes.BIGINT,
      allowNull: true,   // depending if optional or mandatory
      references: {
        model: 'Prescription', // exact table name
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }
  }, {
    tableName: 'JournalSante',
    timestamps: false
  });

  JournalSante.associate = (db) => {
    JournalSante.belongsTo(db.Patient, {
      foreignKey: { name: 'PatientId', allowNull: false },
      onDelete: 'CASCADE'
    });

    JournalSante.belongsTo(db.Prescription, {   // Add this association
      foreignKey: 'PrescriptionId',
      onDelete: 'SET NULL'
    });

    JournalSante.hasMany(db.SuiviMedicament, {
      foreignKey: 'JournalSanteId'
    });

    JournalSante.hasMany(db.SuiviIndicateur, {
      foreignKey: 'JournalSanteId'
    });
  };

  return JournalSante;
};
