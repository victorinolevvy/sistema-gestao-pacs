// backend/migrations/20250418150000-create-pagamentos-table.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('pagamentos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      pac_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Assuming pac_id might be nullable initially or set later
        // If pacs table exists and is required, uncomment references:
        // references: { model: { tableName: 'pacs', schema: 'pacs' }, key: 'id' },
        // onUpdate: 'CASCADE',
        // onDelete: 'SET NULL',
      },
      data_pagamento: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      data_vencimento: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Data de vencimento do pagamento (dia 5 do mês seguinte)'
      },
      valor_pago: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
        allowNull: false,
      },
      valor_regularizado: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
        allowNull: false,
      },
      valor_multa: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
        allowNull: false,
        comment: 'Valor da multa aplicada'
      },
      percentual_multa: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
        allowNull: false,
        comment: 'Percentual da multa aplicada'
      },
      dias_atraso: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Dias de atraso no pagamento'
      },
      mes_referencia: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      ano_referencia: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'PENDENTE',
        allowNull: false,
        comment: 'Status do pagamento (PENDENTE, PAGO, ATRASADO, CANCELADO)'
      },
      // Confirmation fields added in a later migration (20250425130312)
      // usuario_id added/modified in a later migration (20250418153213)
      forma_pagamento: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Forma de pagamento utilizada'
      },
      comprovante: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Caminho do arquivo do comprovante de pagamento'
      },
      // Define usuario_id as STRING initially, as it's altered later
      usuario_id: {
         type: Sequelize.STRING,
         allowNull: true
      },
      data_criacao: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      data_atualizacao: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      }
    }, {
      schema: 'pacs' // Ensure table is created in the correct schema
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'pagamentos', schema: 'pacs' });
  }
};