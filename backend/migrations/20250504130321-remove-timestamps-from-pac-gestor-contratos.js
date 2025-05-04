'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      { tableName: 'pac_gestor_contratos', schema: 'pacs' },
      'createdAt'
    );

    await queryInterface.removeColumn(
      { tableName: 'pac_gestor_contratos', schema: 'pacs' },
      'updatedAt'
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      { tableName: 'pac_gestor_contratos', schema: 'pacs' },
      'createdAt',
      {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    );

    await queryInterface.addColumn(
      { tableName: 'pac_gestor_contratos', schema: 'pacs' },
      'updatedAt',
      {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    );
  }
};
