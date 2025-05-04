const { Pac, Pagamento, Usuario } = require('../models');
const logger = require('../config/logger');

const getDashboardData = async (req, res) => {
  try {
    logger.info('Iniciando busca de dados do dashboard...');
    
    // Contagem de PACs
    logger.debug('Buscando contagem de PACs...');
    const totalPacs = await Pac.count();
    const pacsPendentes = await Pac.count({ where: { status: 'pendente' } });
    const pacsAprovados = await Pac.count({ where: { status: 'aprovado' } });
    const pacsRejeitados = await Pac.count({ where: { status: 'rejeitado' } });
    logger.info('Contagem de PACs:', { totalPacs, pacsPendentes, pacsAprovados, pacsRejeitados });

    // Contagem de pagamentos
    logger.debug('Buscando contagem de pagamentos...');
    const totalPagamentos = await Pagamento.count();
    const pagamentosPendentes = await Pagamento.count({ where: { status: 'pendente' } });
    const pagamentosConfirmados = await Pagamento.count({ where: { status: 'confirmado' } });
    logger.info('Contagem de pagamentos:', { totalPagamentos, pagamentosPendentes, pagamentosConfirmados });

    // Atividades recentes
    logger.debug('Buscando atividades recentes...');
    const atividadesRecentes = await Pac.findAll({
      limit: 5,
      order: [['data_criacao', 'DESC']],
      include: [{
        model: Usuario,
        as: 'gestorAtual',
        attributes: ['nome']
      }]
    });
    logger.info('Atividades recentes encontradas:', { count: atividadesRecentes.length });

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
        titulo: atividade.nome,
        status: atividade.status,
        data: atividade.data_criacao,
        usuario: atividade.gestorAtual ? atividade.gestorAtual.nome : 'Usuário Desconhecido'
      }))
    };

    logger.debug('Dados do dashboard preparados:', { responseLength: JSON.stringify(response).length });
    res.json(response);
  } catch (error) {
    logger.error('Erro ao buscar dados do dashboard:', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erro ao buscar dados do dashboard' });
  }
};

module.exports = {
  getDashboardData
};