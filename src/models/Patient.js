module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define('Patient', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    genre: {
      type: DataTypes.ENUM('homme', 'femme'),
      allowNull: false,
    },
    date_naissance: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    taille: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    poids: {
      type: DataTypes.BIGINT,
      allowNull: false,
    }
  }, {
    tableName: 'Patient',
    timestamps: false,
  });

  Patient.associate = (db) => {
    Patient.belongsTo(db.User, {
      foreignKey: { name: 'UserId', type: DataTypes.BIGINT, allowNull: false },
      onDelete: 'CASCADE',
    });
    Patient.hasMany(db.Medicament, {
      foreignKey: 'PatientId',
    });
    Patient.hasMany(db.Indicateur, {
      foreignKey: 'PatientId',
    });
    Patient.hasMany(db.Prescription, {
      foreignKey: 'PatientId',
    });
  };

  return Patient;
};
