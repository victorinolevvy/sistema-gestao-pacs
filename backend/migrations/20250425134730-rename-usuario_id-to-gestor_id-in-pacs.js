'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Coluna gestor_id já foi criada corretamente na migração 20250419070000-create-pacs-table.js
    // Esta migração de renomeação é desnecessária.
    // await queryInterface.sequelize.query(
    //   'ALTER TABLE pacs.pacs RENAME COLUMN usuario_id TO gestor_id;'
    // );
    console.log('Skipping rename of usuario_id to gestor_id in pacs table as it should already exist as gestor_id.');
  },

  async down (queryInterface, Sequelize) {
    // Reverter a renomeação também é desnecessário.
    // await queryInterface.sequelize.query(
    //   'ALTER TABLE pacs.pacs RENAME COLUMN gestor_id TO usuario_id;'
    // );
    console.log('Skipping revert rename of gestor_id to usuario_id in pacs table.');
  }
};
