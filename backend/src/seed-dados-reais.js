// Seeder para inserir dados reais de dezembro/2024
const { Provincia, Usuario, Pac, Pagamento } = require('../models');

async function seedDadosReais() {
  // Provincias
  await Provincia.bulkCreate([
    { id: 1, nome: 'Maputo' },
    { id: 2, nome: 'Gaza' },
    { id: 3, nome: 'Inhambane' }
  ], { ignoreDuplicates: true });

  // Gestores
  await Usuario.bulkCreate([
    { id: 1, nome: 'Cezerilo Fabrice Gonçalo', email: 'cezerilo@empresa.com', perfil: 'gestor' },
    { id: 2, nome: 'Mario Augusto Machave', email: 'mario@empresa.com', perfil: 'gestor' },
    { id: 3, nome: 'Maria Isabel Rupia', email: 'maria@empresa.com', perfil: 'gestor' }
  ], { ignoreDuplicates: true });

  // PACs
  await Pac.bulkCreate([
    { id: 1, nome: 'Moamba', provincia_id: 1, gestor_id: 1, valor_renda_mensal: 15000, status: 'Em funcionamento', observacao: '' },
    { id: 2, nome: 'Catuane (Matutuine)', provincia_id: 1, gestor_id: 2, valor_renda_mensal: 7500, status: 'Em funcionamento', observacao: 'Julho/24' },
    { id: 3, nome: 'Mapulanguene', provincia_id: 1, gestor_id: 3, valor_renda_mensal: 7500, status: 'Em funcionamento', observacao: '' }
  ], { ignoreDuplicates: true });

  // Pagamentos de dezembro/2024
  await Pagamento.bulkCreate([
    { id: 1, pac_id: 1, valor_pago: 15000, valor_regularizado: 0, data_pagamento: '2024-12-10', mes_referencia: 12, ano_referencia: 2024 },
    { id: 2, pac_id: 2, valor_pago: 24000, valor_regularizado: 0, data_pagamento: '2024-12-15', mes_referencia: 12, ano_referencia: 2024 },
    { id: 3, pac_id: 3, valor_pago: 7500, valor_regularizado: 0, data_pagamento: '2024-12-20', mes_referencia: 12, ano_referencia: 2024 }
  ], { ignoreDuplicates: true });

  console.log('Seed de dados reais de dezembro/2024 concluído!');
}

seedDadosReais().then(() => process.exit()).catch(err => { console.error(err); process.exit(1); });
