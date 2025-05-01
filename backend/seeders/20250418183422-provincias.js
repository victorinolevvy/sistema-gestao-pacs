'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Specify schema for bulkInsert
    await queryInterface.bulkInsert({ tableName: 'provincias', schema: 'pacs' }, [
      { nome: 'Niassa', codigo: 'NIA', data_criacao: new Date(), data_atualizacao: new Date() },
      { nome: 'Cabo Delgado', codigo: 'CDG', data_criacao: new Date(), data_atualizacao: new Date() },
      { nome: 'Nampula', codigo: 'NPL', data_criacao: new Date(), data_atualizacao: new Date() },
      { nome: 'Zambézia', codigo: 'ZBZ', data_criacao: new Date(), data_atualizacao: new Date() },
      { nome: 'Tete', codigo: 'TET', data_criacao: new Date(), data_atualizacao: new Date() },
      { nome: 'Manica', codigo: 'MAN', data_criacao: new Date(), data_atualizacao: new Date() },
      { nome: 'Sofala', codigo: 'SOF', data_criacao: new Date(), data_atualizacao: new Date() },
      { nome: 'Inhambane', codigo: 'INH', data_criacao: new Date(), data_atualizacao: new Date() },
      { nome: 'Gaza', codigo: 'GAZ', data_criacao: new Date(), data_atualizacao: new Date() },
      { nome: 'Maputo Província', codigo: 'MPT', data_criacao: new Date(), data_atualizacao: new Date() },
      { nome: 'Maputo Cidade', codigo: 'MPC', data_criacao: new Date(), data_atualizacao: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // Specify schema for bulkDelete
    await queryInterface.bulkDelete({ tableName: 'provincias', schema: 'pacs' }, null, {});
  }
};
