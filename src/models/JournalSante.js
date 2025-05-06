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
  
      JournalSante.hasMany(db.SuiviMedicament, {
        foreignKey: 'JournalSanteId'
      });
  
      JournalSante.hasMany(db.SuiviIndicateur, {
        foreignKey: 'JournalSanteId'
      });
    };
  
    return JournalSante;
  };
  