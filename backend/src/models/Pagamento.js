const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pagamento = sequelize.define('Pagamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pac_id: {
    type: DataTypes.INTEGER
  },
  data_pagamento: {
    type: DataTypes.DATEONLY
  },
  data_vencimento: {
    type: DataTypes.DATEONLY,
    comment: 'Data de vencimento do pagamento (dia 5 do mês seguinte)'
  },
  valor_pago: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  valor_regularizado: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  valor_multa: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Valor da multa aplicada'
  },
  percentual_multa: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Percentual da multa aplicada'
  },
  dias_atraso: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Dias de atraso no pagamento'
  },
  mes_referencia: {
    type: DataTypes.INTEGER
  },
  ano_referencia: {
    type: DataTypes.INTEGER
  },
  observacoes: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'PENDENTE',
    comment: 'Status do pagamento (PENDENTE, PAGO, ATRASADO, CANCELADO)'
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
      key: 'id'
    },
    comment: 'ID do usuário que confirmou o pagamento'
  },
  data_confirmacao: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data e hora da confirmação do pagamento'
  },
  forma_pagamento: {
    type: DataTypes.STRING(50),
    comment: 'Forma de pagamento utilizada'
  },
  comprovante: {
    type: DataTypes.STRING(255),
    comment: 'Caminho do arquivo do comprovante de pagamento'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      key: 'id'
    }
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
  tableName: 'pagamentos',
  schema: 'pacs',
  timestamps: false
});

module.exports = Pagamento;