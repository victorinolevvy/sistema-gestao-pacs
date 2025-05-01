'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(
      { tableName: 'usuarios', schema: 'pacs' },
      {
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
        email: {
          type: Sequelize.STRING(150),
          allowNull: false,
          unique: true
        },
        senha: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        cargo: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        role: {
          type: Sequelize.ENUM('ADMIN', 'SUPERVISOR', 'VISUALIZADOR', 'GESTOR'),
          allowNull: false
        },
        ativo: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false
        },
        data_criacao: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
          allowNull: false
        },
        ultimo_acesso: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'usuarios', schema: 'pacs' });
  }
};
