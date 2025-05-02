const { Pac, Pagamento, Usuario } = require('../models'); // Corrigido de PAC para Pac

const getDashboardData = async (req, res) => {
  try {
    console.log('Iniciando busca de dados do dashboard...');
    
    // Contagem de PACs
    console.log('Buscando contagem de PACs...');
    const totalPacs = await Pac.count(); // Usar Pac
    const pacsPendentes = await Pac.count({ where: { status: 'pendente' } }); // Usar Pac
    const pacsAprovados = await Pac.count({ where: { status: 'aprovado' } }); // Usar Pac
    const pacsRejeitados = await Pac.count({ where: { status: 'rejeitado' } }); // Usar Pac
    console.log('Contagem de PACs:', { totalPacs, pacsPendentes, pacsAprovados, pacsRejeitados });

    // Contagem de pagamentos
    console.log('Buscando contagem de pagamentos...');
    const totalPagamentos = await Pagamento.count();
    const pagamentosPendentes = await Pagamento.count({ where: { status: 'pendente' } });
    const pagamentosConfirmados = await Pagamento.count({ where: { status: 'confirmado' } });
    console.log('Contagem de pagamentos:', { totalPagamentos, pagamentosPendentes, pagamentosConfirmados });

    // Atividades recentes
    console.log('Buscando atividades recentes...');
    const atividadesRecentes = await Pac.findAll({
      limit: 5,
      order: [['data_criacao', 'DESC']],
      include: [{
        model: Usuario,
        as: 'gestor', // usar alias definido nos models
        attributes: ['nome']
      }]
    });
    console.log('Atividades recentes encontradas:', atividadesRecentes.length);

    const response = {
      estatisticas: {
        pacs: {
          total: totalPacs,
          pendentes: pacsPendentes,
          aprovados: pacsAprovados,
          rejeitados: pacsRejeitados
        },
        pagamentos: {
          total: totalPagamentos,
          pendentes: pagamentosPendentes,
          confirmados: pagamentosConfirmados
        }
      },
      atividadesRecentes: atividadesRecentes.map(atividade => ({
        id: atividade.id,
        titulo: atividade.nome, // Usar nome do Pac como título (ou outro campo apropriado)
        status: atividade.status,
        data: atividade.data_criacao, // Usar data_criacao
        usuario: atividade.gestor ? atividade.gestor.nome : 'Usuário Desconhecido' // Corrected to use 'gestor' alias
      }))
    };

    console.log('Dados do dashboard preparados:', response);
    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
};

module.exports = {
  getDashboardData
};