const {
    differenceInCalendarDays,
    addMonths,
    setDate,
    endOfDay,
    parseISO,
    isValid
} = require('date-fns');

/**
 * Calcula os detalhes de atraso e multa para um pagamento.
 * @param {string | Date} dataPagamentoInput - A data em que o pagamento foi (ou será) efetuado.
 * @param {number} mesReferencia - O mês de referência do pagamento (1-12).
 * @param {number} anoReferencia - O ano de referência do pagamento.
 * @param {number | string} valorRendaReferenciaInput - O valor da renda base para o período.
 * @returns {object} - Objeto com { dias_atraso, percentual_multa, valor_multa, data_vencimento }
 */
const calcularDetalhesAtrasoMulta = (dataPagamentoInput, mesReferencia, anoReferencia, valorRendaReferenciaInput) => {
    const valorRendaReferencia = parseFloat(valorRendaReferenciaInput || 0);
    let dataPagamento;

    // Tenta fazer parse da data de pagamento, se for string
    if (typeof dataPagamentoInput === 'string') {
        dataPagamento = parseISO(dataPagamentoInput);
    } else {
        dataPagamento = dataPagamentoInput;
    }

    // Verifica se a data de pagamento é válida
    if (!isValid(dataPagamento)) {
        // Se a data for inválida, retorna valores padrão sem multa
        // Considera-se que o cálculo só é relevante com uma data válida.
        // Poderia lançar um erro ou usar a data atual como fallback.
        console.warn("Data de pagamento inválida recebida:", dataPagamentoInput);
        // Define uma data de vencimento baseada na referência para consistência
        const dataReferencia = new Date(anoReferencia, mesReferencia - 1, 1);
        const dataVencimentoBase = setDate(addMonths(dataReferencia, 1), 5);
        return {
            dias_atraso: 0,
            percentual_multa: '0.00',
            valor_multa: '0.00',
            data_vencimento: dataVencimentoBase.toISOString().split('T')[0]
        };
    }

    // Calcula a data de vencimento (dia 5 do mês seguinte)
    // Cria uma data no mês de referência
    const dataReferencia = new Date(anoReferencia, mesReferencia - 1, 1);
    // Adiciona 1 mês e define o dia para 5
    let dataVencimento = setDate(addMonths(dataReferencia, 1), 5);
    // Define a hora para o final do dia para incluir o dia 5 completo
    dataVencimento = endOfDay(dataVencimento);

    let dias_atraso = 0;
    let percentual_multa = 0;
    let valor_multa = 0;

    // Compara data de pagamento com data de vencimento
    if (dataPagamento > dataVencimento) {
        // Calcula a diferença em dias corridos
        dias_atraso = differenceInCalendarDays(dataPagamento, dataVencimento);

        if (dias_atraso > 60) {
            percentual_multa = 15.00;
            // TODO: Implementar lógica cumulativa se necessário (Opção A ou B)
            // Exemplo Opção A (Taxa aumenta 15% a cada 30 dias após 60):
            // const periodosAdicionais = Math.floor((dias_atraso - 61) / 30);
            // percentual_multa = 15.00 + (periodosAdicionais * 15.00);
        } else if (dias_atraso > 30) {
            percentual_multa = 10.00;
        } else { // dias_atraso > 0
            percentual_multa = 5.00;
        }

        if (valorRendaReferencia > 0) {
             valor_multa = (valorRendaReferencia * percentual_multa) / 100;
        }
    }

    return {
        dias_atraso,
        percentual_multa: percentual_multa.toFixed(2),
        valor_multa: valor_multa.toFixed(2),
        // Formata a data de vencimento para YYYY-MM-DD
        data_vencimento: dataVencimento.toISOString().split('T')[0]
    };
};

/**
 * Determina o status do pagamento comparando o valor pago com o valor devido.
 * @param {number | string} valorPagoInput - O valor total pago.
 * @param {number | string} valorDevidoInput - O valor total devido (renda + multa).
 * @returns {string} - Status do pagamento (PENDENTE, PAGO_PARCIAL, PAGO, N/A)
 */
const determinarStatusPagamento = (valorPagoInput, valorDevidoInput) => {
    const valorPago = parseFloat(valorPagoInput || 0);
    const valorDevido = parseFloat(valorDevidoInput || 0);

    if (valorDevido <= 0) {
        // Se não há valor devido (renda 0 e sem multa), considera pago se algo foi pago, senão N/A?
        // Ou talvez sempre PAGO se devido é 0? Vamos considerar PAGO.
        return 'PAGO'; // Ou 'N/A' dependendo da regra de negócio
    }

    // Usar uma pequena tolerância para comparações de ponto flutuante
    const tolerance = 0.001;
    if (valorPago >= valorDevido - tolerance) {
        return 'PAGO';
    } else if (valorPago > tolerance) {
        return 'PAGO_PARCIAL';
    } else {
        return 'PENDENTE';
    }
};


module.exports = {
    calcularDetalhesAtrasoMulta,
    determinarStatusPagamento
};
