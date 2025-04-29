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
    isSubscribed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    state: {
      type: DataTypes.ENUM('Danger', 'Normal', 'Good'),
      allowNull: false,
      defaultValue: 'Normal',
    },
  }, {
    tableName: 'Patient',
    timestamps: false,
  });

  Patient.associate = (db) => {
    Patient.belongsTo(db.User, {
      foreignKey: { name: 'UserId', type: DataTypes.BIGINT, allowNull: false },
      onDelete: 'CASCADE',
    });
    Patient.belongsTo(db.Medecin, {
      foreignKey: { name: 'MedecinId', type: DataTypes.BIGINT, allowNull: true },
      onDelete: 'SET NULL',
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
