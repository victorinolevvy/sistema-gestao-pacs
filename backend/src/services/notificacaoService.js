const nodemailer = require('nodemailer');
const Pagamento = require('../models/Pagamento');
const Pac = require('../models/Pac');
const Usuario = require('../models/Usuario');
const { Op } = require('sequelize');

// Configurar transporter do nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const notificacaoService = {
  async verificarPagamentosAtrasados() {
    const hoje = new Date();
    const pagamentosAtrasados = await Pagamento.findAll({
      where: {
        data_vencimento: {
          [Op.lt]: hoje
        },
        status: 'PENDENTE'
      },
      include: [
        {
          model: Pac,
          attributes: ['nome', 'provincia']
        }
      ]
    });

    const admins = await Usuario.findAll({
      where: {
        role: 'ADMIN'
      }
    });

    for (const pagamento of pagamentosAtrasados) {
      const diasAtraso = Math.floor((hoje - pagamento.data_vencimento) / (1000 * 60 * 60 * 24));
      
      const emailContent = {
        from: process.env.SMTP_FROM,
        to: admins.map(admin => admin.email).join(','),
        subject: `[URGENTE] Pagamento Atrasado - PAC ${pagamento.Pac.nome}`,
        html: `
          <h2>Notificação de Pagamento Atrasado</h2>
          <p>O pagamento do PAC <strong>${pagamento.Pac.nome}</strong> está atrasado há ${diasAtraso} dias.</p>
          <p><strong>Detalhes:</strong></p>
          <ul>
            <li>Província: ${pagamento.Pac.provincia}</li>
            <li>Valor: ${pagamento.valor}</li>
            <li>Vencimento: ${pagamento.data_vencimento.toLocaleDateString()}</li>
          </ul>
          <p>Por favor, tome as providências necessárias.</p>
        `
      };

      try {
        await transporter.sendMail(emailContent);
        console.log(`Notificação enviada para pagamento atrasado do PAC ${pagamento.Pac.nome}`);
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
      }
    }
  },

  async notificarVencimentoProximo() {
    const hoje = new Date();
    const trintaDiasAFrente = new Date(hoje.setDate(hoje.getDate() + 30));

    const pagamentosProximos = await Pagamento.findAll({
      where: {
        data_vencimento: {
          [Op.between]: [hoje, trintaDiasAFrente]
        },
        status: 'PENDENTE'
      },
      include: [
        {
          model: Pac,
          attributes: ['nome', 'provincia']
        }
      ]
    });

    const admins = await Usuario.findAll({
      where: {
        role: 'ADMIN'
      }
    });

    for (const pagamento of pagamentosProximos) {
      const diasParaVencimento = Math.floor((pagamento.data_vencimento - hoje) / (1000 * 60 * 60 * 24));
      
      const emailContent = {
        from: process.env.SMTP_FROM,
        to: admins.map(admin => admin.email).join(','),
        subject: `Pagamento a Vencer - PAC ${pagamento.Pac.nome}`,
        html: `
          <h2>Lembrete de Pagamento</h2>
          <p>O pagamento do PAC <strong>${pagamento.Pac.nome}</strong> vencerá em ${diasParaVencimento} dias.</p>
          <p><strong>Detalhes:</strong></p>
          <ul>
            <li>Província: ${pagamento.Pac.provincia}</li>
            <li>Valor: ${pagamento.valor}</li>
            <li>Vencimento: ${pagamento.data_vencimento.toLocaleDateString()}</li>
          </ul>
          <p>Por favor, planeje o pagamento com antecedência.</p>
        `
      };

      try {
        await transporter.sendMail(emailContent);
        console.log(`Lembrete enviado para pagamento próximo do PAC ${pagamento.Pac.nome}`);
      } catch (error) {
        console.error('Erro ao enviar lembrete:', error);
      }
    }
  }
};

module.exports = notificacaoService; 