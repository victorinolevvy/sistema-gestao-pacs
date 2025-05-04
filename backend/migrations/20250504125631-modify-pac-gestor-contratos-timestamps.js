'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Altera as colunas existentes para permitir NULL
    await queryInterface.sequelize.query(`
      ALTER TABLE pacs.pac_gestor_contratos 
      ALTER COLUMN "createdAt" DROP NOT NULL,
      ALTER COLUMN "updatedAt" DROP NOT NULL;
    `);

    // Atualiza os registros existentes com a data atual
    await queryInterface.sequelize.query(`
      UPDATE pacs.pac_gestor_contratos 
      SET "createdAt" = NOW(), 
          "updatedAt" = NOW() 
      WHERE "createdAt" IS NULL;
    `);
  },

  async down (queryInterface, Sequelize) {
    // Restaura as restrições NOT NULL se precisar fazer rollback
    await queryInterface.sequelize.query(`
      ALTER TABLE pacs.pac_gestor_contratos 
      ALTER COLUMN "createdAt" SET NOT NULL,
      ALTER COLUMN "updatedAt" SET NOT NULL;
    `);
  }
};
