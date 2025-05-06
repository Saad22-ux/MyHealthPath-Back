module.exports = (sequelize, DataTypes) => {
    const SuiviIndicateur = sequelize.define('SuiviIndicateur', {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      mesure: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      valeur: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      tableName: 'SuiviIndicateur',
      timestamps: false
    });
  
    SuiviIndicateur.associate = (db) => {
      SuiviIndicateur.belongsTo(db.Indicateur, {
        foreignKey: { name: 'IndicateurId', allowNull: false }
      });
      SuiviIndicateur.belongsTo(db.JournalSante, {
        foreignKey: { name: 'JournalSanteId', allowNull: false },
        onDelete: 'CASCADE'
      });
    };
  
    return SuiviIndicateur;
  };
  