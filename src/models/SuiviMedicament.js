module.exports = (sequelize, DataTypes) => {
    const SuiviMedicament = sequelize.define('SuiviMedicament', {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      pris: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    }, {
      tableName: 'SuiviMedicament',
      timestamps: false
    });
  
    SuiviMedicament.associate = (db) => {
      SuiviMedicament.belongsTo(db.Medicament, {
        foreignKey: { name: 'MedicamentId', allowNull: false }
      });
      SuiviMedicament.belongsTo(db.JournalSante, {
        foreignKey: { name: 'JournalSanteId', allowNull: false },
        onDelete: 'CASCADE'
      });
    };
  
    return SuiviMedicament;
  };
  