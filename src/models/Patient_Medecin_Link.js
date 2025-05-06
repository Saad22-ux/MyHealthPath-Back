module.exports = (sequelize, DataTypes) => {
    const Patient_Medecin_Link = sequelize.define('Patient_Medecin_Link', {
      id_patient: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        references: {
          model: 'Patient',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      id_medecin: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        references: {
          model: 'Medecin',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      isSubscribed: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    }, {
      tableName: 'Patient_Medecin_Link',
      timestamps: false,
    });
  
    Patient_Medecin_Link.associate = (db) => {
      Patient_Medecin_Link.belongsTo(db.Patient, {
        foreignKey: 'id_patient',
        onDelete: 'CASCADE',
      });
      Patient_Medecin_Link.belongsTo(db.Medecin, {
        foreignKey: 'id_medecin',
        onDelete: 'CASCADE',
      });
  
      db.Patient.belongsToMany(db.Medecin, {
        through: Patient_Medecin_Link,
        foreignKey: 'id_patient',
        otherKey: 'id_medecin',
      });
      db.Medecin.belongsToMany(db.Patient, {
        through: Patient_Medecin_Link,
        foreignKey: 'id_medecin',
        otherKey: 'id_patient',
      });
    };
  
    return Patient_Medecin_Link;
  };
  