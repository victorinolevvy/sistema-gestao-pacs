'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('provincias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      codigo: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true // Adicionar unique constraint para o código
      },
      data_criacao: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      data_atualizacao: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    },
    {
      schema: 'pacs' // Adicionar esta opção para especificar o schema
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'provincias', schema: 'pacs' }); // Especificar schema ao remover
  }
};
