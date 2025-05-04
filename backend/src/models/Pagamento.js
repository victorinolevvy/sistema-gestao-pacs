const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pagamento = sequelize.define('Pagamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pac_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { // Assuming foreign key constraint exists or should exist
      model: 'pacs', // Name of the PACs table
      key: 'id'
    }
  },
  data_pagamento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Data em que o pagamento foi efetivamente realizado'
  },
  valor_efetuado: { // ADDED
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Valor efetivamente pago pelo gestor'
  },
  valor_multa: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Valor da multa calculada com base no atraso'
  },
  valor_devido: { // ADDED
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false, // Should be calculated based on rent + multa
    comment: 'Valor total devido (renda do PAC + multa)'
  },
  mes_referencia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ano_referencia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  observacoes: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'PENDENTE',
    comment: 'Status calculado (PENDENTE, PAGO_PARCIALMENTE, PAGO, VALOR_DEVIDO_INVALIDO)' // UPDATED COMMENT
  },
  status_confirmacao: {
    type: DataTypes.ENUM('PENDENTE', 'CONFIRMADO', 'REJEITADO'),
    defaultValue: 'PENDENTE',
    allowNull: false,
    comment: 'Status da confirmação do pagamento pelo admin/supervisor'
  },
  confirmado_por_usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios', // Name of the Usuarios table
      key: 'id'
    },
    comment: 'ID do usuário que confirmou/rejeitou o pagamento'
  },
  data_confirmacao: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data e hora da confirmação/rejeição do pagamento'
  },
  comprovativo_url: { // RENAMED from comprovante
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL ou caminho do arquivo do comprovante de pagamento'
  },
  usuario_id: { // User who registered the payment
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios', // Name of the Usuarios table
      key: 'id'
    },
    comment: 'ID do usuário que registrou o pagamento'
  },
  createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: 'data_criacao' // Map to existing column name if needed
  },
  updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: 'data_atualizacao' // Map to existing column name if needed
  }
}, {
  tableName: 'pagamentos',
  schema: 'pacs',
  timestamps: true, // Enable Sequelize timestamps
  // freezeTableName: true // Prevent Sequelize from pluralizing
});

module.exports = Pagamento;