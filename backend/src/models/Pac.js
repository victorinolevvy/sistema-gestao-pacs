const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Provincia = require('./Provincia');
// const Usuario = require('./Usuario'); // Remover importação

const Pac = sequelize.define('Pac', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  endereco: {
    type: DataTypes.TEXT
  },
  provincia_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Provincia, // Manter referência ao modelo importado
      key: 'id'
    }
  },
  gestor_id: { // Rename usuario_id to gestor_id
    type: DataTypes.INTEGER,
    allowNull: true, // Or false if a manager is always required
    references: {
      // model: Usuario, // Define association in index.js
      key: 'id'
    },
    comment: 'ID do usuário gestor responsável pelo PAC' // Add comment
  },
  valor_renda_mensal: {
    type: DataTypes.DECIMAL(12, 2)
  },
  status: {
    type: DataTypes.STRING(50)
  },
  // Novos campos para configuração de multas
  multa_padrao: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 5.00,
    comment: 'Percentual padrão de multa por atraso'
  },
  dias_para_multa: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
    comment: 'Dias após o vencimento para aplicar multa'
  },
  multa_acumulativa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Se a multa é acumulativa a cada período'
  },
  periodo_multa: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
    comment: 'Período em dias para acumular multa'
  },
  // Campos para status financeiro
  status_financeiro: {
    type: DataTypes.STRING(50),
    defaultValue: 'REGULAR',
    comment: 'Status financeiro do PAC (REGULAR, ATRASADO, INADIMPLENTE)'
  },
  dias_atraso: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Dias de atraso no pagamento'
  },
  valor_devido: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Valor total devido incluindo multas'
  },
  data_criacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  data_atualizacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'pacs',
  schema: 'pacs',
  timestamps: false
});

// Remover definições de associação daqui
// Pac.belongsTo(Provincia, { foreignKey: 'provincia_id', as: 'provincia' });
// Provincia.hasMany(Pac, { foreignKey: 'provincia_id', as: 'pacs' });
// Pac.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = Pac;