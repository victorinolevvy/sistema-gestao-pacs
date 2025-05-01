const cron = require('node-cron');
const notificacaoService = require('./notificacaoService');

const agendadorService = {
  iniciar() {
    // Verificar pagamentos atrasados todos os dias às 8h
    cron.schedule('0 8 * * *', async () => {
      console.log('Iniciando verificação de pagamentos atrasados...');
      try {
        await notificacaoService.verificarPagamentosAtrasados();
        console.log('Verificação de pagamentos atrasados concluída.');
      } catch (error) {
        console.error('Erro ao verificar pagamentos atrasados:', error);
      }
    });

    // Verificar pagamentos próximos do vencimento todos os dias às 9h
    cron.schedule('0 9 * * *', async () => {
      console.log('Iniciando verificação de pagamentos próximos do vencimento...');
      try {
        await notificacaoService.notificarVencimentoProximo();
        console.log('Verificação de pagamentos próximos do vencimento concluída.');
      } catch (error) {
        console.error('Erro ao verificar pagamentos próximos do vencimento:', error);
      }
    });

    console.log('Agendador de tarefas iniciado com sucesso.');
  }
};

module.exports = agendadorService; 