// backend/migrations/20250419070000-create-pacs-table.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('pacs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      endereco: {
        type: Sequelize.TEXT,
        allowNull: true // Based on model definition
      },
      provincia_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Allow null initially, can be enforced later if needed
        references: {
          model: { tableName: 'provincias', schema: 'pacs' }, // Reference the provincias table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Or 'RESTRICT'/'CASCADE' depending on requirements
      },
      // Create gestor_id directly as INTEGER, assuming the rename migration might be removed later
      gestor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'usuarios', schema: 'pacs' }, // Reference the usuarios table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Or 'RESTRICT'/'CASCADE'
        comment: 'ID do usuário gestor responsável pelo PAC'
      },
      valor_renda_mensal: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true // Based on model definition
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: true // Based on model definition
      },
      multa_padrao: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 5.00,
        allowNull: true // Allow null to match model's defaultValue behavior
      },
      dias_para_multa: {
        type: Sequelize.INTEGER,
        defaultValue: 15,
        allowNull: true // Allow null to match model's defaultValue behavior
      },
      multa_acumulativa: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true // Allow null to match model's defaultValue behavior
      },
      periodo_multa: {
        type: Sequelize.INTEGER,
        defaultValue: 15,
        allowNull: true // Allow null to match model's defaultValue behavior
      },
      status_financeiro: {
        type: Sequelize.STRING(50),
        defaultValue: 'REGULAR',
        allowNull: true // Allow null to match model's defaultValue behavior
      },
      dias_atraso: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true // Allow null to match model's defaultValue behavior
      },
      valor_devido: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
        allowNull: true // Allow null to match model's defaultValue behavior
      },
      data_criacao: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false // Default value implies not null
      },
      data_atualizacao: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false // Default value implies not null
      }
    }, {
      schema: 'pacs' // Ensure table is created in the correct schema
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'pacs', schema: 'pacs' });
  }
};