'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remover a coluna 'gestor' da tabela 'pacs' no schema 'pacs'
    // await queryInterface.removeColumn(
    //   {
    //     tableName: 'pacs',
    //     schema: 'pacs'
    //   },
    //   'gestor'
    // );
    console.log('Skipping removal of column "gestor" as it likely does not exist anymore.'); // Add log
  },

  async down (queryInterface, Sequelize) {
    // Adicionar a coluna 'gestor' de volta em caso de rollback
    await queryInterface.addColumn(
      {
        tableName: 'pacs',
        schema: 'pacs'
      },
      'gestor',
      {
        type: Sequelize.STRING(150),
        allowNull: true // Manter como nullable, como era antes
      }
    );
  }
};
