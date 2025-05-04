'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PacGestorContrato extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      PacGestorContrato.belongsTo(models.Pac, {
        foreignKey: 'pac_id',
        as: 'pac'
      });
      PacGestorContrato.belongsTo(models.Usuario, {
        foreignKey: 'gestor_id',
        as: 'gestor' // Alias for the associated manager
      });
    }
  }
  PacGestorContrato.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    pac_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Pacs',
        key: 'id'
      }
    },
    gestor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'id'
      }
    },
    valor_renda: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    data_inicio: {
      allowNull: false,
      type: DataTypes.DATEONLY
    },
    data_fim: {
      allowNull: true,
      type: DataTypes.DATEONLY
    }
  }, {
    sequelize,
    modelName: 'PacGestorContrato',
    tableName: 'pac_gestor_contratos', // Corrected table name (snake_case, plural)
    schema: 'pacs', // Explicitly specify the schema
    timestamps: false // Desabilitar timestamps automáticos
  });
  return PacGestorContrato;
};
