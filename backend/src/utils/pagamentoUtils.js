const {
    differenceInCalendarDays,
    addMonths,
    setDate,
    endOfDay,
    parseISO,
    isValid,
    startOfDay
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
 * @returns {string} - Status do pagamento (PENDENTE, PAGO_PARCIAL, PAGO)
 */
const determinarStatusPagamento = (valorPagoInput, valorDevidoInput) => {
    const valorPago = parseFloat(valorPagoInput || 0);
    const valorDevido = parseFloat(valorDevidoInput || 0);

    if (valorDevido <= 0) {
        // Se não há valor devido (renda 0 e sem multa), considera pago se algo foi pago, senão N/A?
        // Ou talvez sempre PAGO se devido é 0? Vamos considerar PAGO.
        return valorPago > 0 ? 'PAGO' : 'PENDENTE'; // Ou 'PAGO' sempre se devido <= 0
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

/**
 * Calcula a multa por atraso com base nas regras especificadas (cumulative based on days late).
 *
 * Regras:
 * - Vencimento: Dia 5 do mês seguinte ao de referência.
 * - Até dia 5 do M+1: 0%
 * - Dia 6 do M+1 até Dia 5 do M+1 + 30 dias: 5%
 * - Após Dia 5 do M+1 + 30 dias até Dia 5 do M+1 + 60 dias: +10% (Total 15%)
 * - Após Dia 5 do M+1 + 60 dias até Dia 5 do M+1 + 90 dias: +15% (Total 30%)
 * - Para cada 30 dias subsequentes: +15%
 *
 * @param {number} mesReferencia Mês de referência do pagamento (1-12).
 * @param {number} anoReferencia Ano de referência do pagamento.
 * @param {Date} dataPagamento Data em que o pagamento foi efetuado.
 * @param {number} valorRendaMensal O valor base da renda mensal do PAC.
 * @returns {number} O valor da multa calculada.
 */
function calcularMulta(mesReferencia, anoReferencia, dataPagamento, valorRendaMensal) {
    if (!valorRendaMensal || valorRendaMensal <= 0) {
        return 0; // Sem renda, sem multa
    }

    // Validar entradas
    if (!mesReferencia || !anoReferencia || !dataPagamento || !(dataPagamento instanceof Date) || isNaN(dataPagamento)) {
        console.error("Entradas inválidas para calcularMulta", { mesReferencia, anoReferencia, dataPagamento, valorRendaMensal });
        return 0; // Retorna 0 em caso de erro de entrada
    }

    // Normalizar datas para início do dia para evitar problemas com horas/minutos
    const dtPagamento = startOfDay(dataPagamento);

    // Data limite para pagamento sem multa: dia 5 do mês SEGUINTE ao mês de referência
    // Mês em Date() é 0-indexado, então `mesReferencia` (1-12) já aponta para o mês seguinte.
    const dataLimiteSemMulta = startOfDay(new Date(anoReferencia, mesReferencia, 5));

    // Se o pagamento foi feito ATÉ a data limite, não há multa
    if (dtPagamento <= dataLimiteSemMulta) {
        return 0;
    }

    // --- Cálculo da Multa baseado em dias de atraso ---
    const diasDeAtraso = differenceInCalendarDays(dtPagamento, dataLimiteSemMulta);
    let percentualMultaTotal = 0;
    const valorBase = parseFloat(valorRendaMensal);

    if (diasDeAtraso <= 0) { // Double check, should be covered above
        return 0;
    }

    // Faixa 1: 1 a 30 dias de atraso
    if (diasDeAtraso >= 1) {
        percentualMultaTotal = 0.05; // 5%
    }

    // Faixa 2: 31 a 60 dias de atraso
    if (diasDeAtraso >= 31) {
        percentualMultaTotal += 0.10; // +10% (Total 15%)
    }

    // Faixa 3: 61 a 90 dias de atraso
    if (diasDeAtraso >= 61) {
        percentualMultaTotal += 0.15; // +15% (Total 30%)
    }

    // Faixas subsequentes: +15% a cada 30 dias após 90 dias
    if (diasDeAtraso >= 91) {
        // Calcular quantos períodos completos de 30 dias se passaram *após* os primeiros 90 dias
        const diasApos90 = diasDeAtraso - 90;
        const periodosAdicionaisDe30Dias = Math.floor((diasApos90 -1) / 30) + 1; // +1 because >= 91 already counts
        percentualMultaTotal += periodosAdicionaisDe30Dias * 0.15;
    }


    // Calcula o valor final da multa
    const valorMulta = valorBase * percentualMultaTotal;

    // Arredonda para 2 casas decimais (importante para valores monetários)
    return Math.round(valorMulta * 100) / 100;
}

/**
 * Calcula o valor total devido, somando a renda base e a multa.
 *
 * @param {number} valorRendaMensal O valor base da renda.
 * @param {number} valorMulta O valor da multa calculado.
 * @returns {number} O valor total devido.
 */
function calcularValorDevido(valorRendaMensal, valorMulta) {
    const renda = parseFloat(valorRendaMensal || 0);
    const multa = parseFloat(valorMulta || 0);
    const devido = renda + multa;
    return Math.round(devido * 100) / 100; // Arredonda para 2 casas decimais
}

module.exports = {
    calcularDetalhesAtrasoMulta,
    determinarStatusPagamento, // Export the function
    calcularMulta,
    calcularValorDevido
};
