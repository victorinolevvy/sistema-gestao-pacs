'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Specify the schema in the options object
    await queryInterface.createTable('pac_gestor_contratos', { // Use snake_case for table name
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pac_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { 
            tableName: 'pacs',
            schema: 'pacs' 
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      gestor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { 
            tableName: 'usuarios',
            schema: 'pacs' 
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      valor_renda: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      data_inicio: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      data_fim: {
        allowNull: true,
        type: Sequelize.DATEONLY
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }, { 
      schema: 'pacs' // Specify the schema here
    });
  },

  async down (queryInterface, Sequelize) {
    // Specify the schema when dropping the table
    await queryInterface.dropTable({ tableName: 'pac_gestor_contratos', schema: 'pacs' });
  }
};
