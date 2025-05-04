'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Use object notation for table name + schema
    await queryInterface.addColumn(
      { tableName: 'pacs', schema: 'pacs' }, // Specify table and schema
      'data_inicio_atividade',
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Data de início de operação ou cobrança do PAC'
      }
    );
  },

  async down (queryInterface, Sequelize) {
    // Use object notation for table name + schema
    await queryInterface.removeColumn(
      { tableName: 'pacs', schema: 'pacs' }, // Specify table and schema
      'data_inicio_atividade'
    );
  }
};
