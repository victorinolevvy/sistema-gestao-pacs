// filepath: frontend/src/pages/Pagamentos/RegistrarPagamento.jsx
import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    CircularProgress,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth instead of AuthContext
import { getMeusPacs } from '../../services/pacService'; // Assuming pacService exists
import { criarPagamento } from '../../services/pagamentoService'; // Assuming pagamentoService exists

const meses = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
];

const currentYear = new Date().getFullYear();
const anos = Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years

function RegistrarPagamento() {
    const [pacId, setPacId] = useState('');
    const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [valorPago, setValorPago] = useState('');
    const [valorRegularizado, setValorRegularizado] = useState('');
    const [mesReferencia, setMesReferencia] = useState(new Date().getMonth() + 1); // Default to current month
    const [anoReferencia, setAnoReferencia] = useState(currentYear);
    const [observacoes, setObservacoes] = useState('');
    const [comprovativoUrl, setComprovativoUrl] = useState(''); // Simple URL input for now
    const [meusPacs, setMeusPacs] = useState([]);
    const [loadingPacs, setLoadingPacs] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth(); // Use the useAuth hook
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPacs = async () => {
            // Ensure user is loaded and is a GESTOR
            if (user && user.role === 'GESTOR') {
                try {
                    // Assuming getMeusPacs fetches PACs assigned to the logged-in GESTOR
                    const response = await getMeusPacs();
                    setMeusPacs(response.data || []);
                } catch (err) {
                    console.error("Erro ao buscar PACs:", err);
                    setError('Falha ao carregar seus PACs.');
                } finally {
                    setLoadingPacs(false);
                }
            } else if (user && user.role !== 'GESTOR') {
                 setError('Apenas gestores podem registrar pagamentos.');
                 setLoadingPacs(false);
            }
            // If user is not loaded yet, wait for AuthContext to provide it
        };

        fetchPacs();
    }, [user]); // Re-run if user context changes

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        if (!pacId) {
            setError('Por favor, selecione um PAC.');
            setSubmitting(false);
            return;
        }

        const pagamentoData = {
            pac_id: parseInt(pacId, 10),
            data_pagamento: dataPagamento,
            valor_pago: parseFloat(valorPago || 0),
            valor_regularizado: parseFloat(valorRegularizado || 0),
            mes_referencia: parseInt(mesReferencia, 10),
            ano_referencia: parseInt(anoReferencia, 10),
            observacoes: observacoes,
            comprovativo_url: comprovativoUrl,
        };

        try {
            const response = await criarPagamento(pagamentoData);
            setSuccess(`Pagamento para o PAC ${response.data?.pac?.nome} registrado com sucesso! Status de confirmação: PENDENTE.`);
            // Optionally reset form or navigate away
            // setPacId('');
            // setValorPago('');
            // setValorRegularizado('');
            // setObservacoes('');
            // setComprovativoUrl('');
            // navigate('/pagamentos'); // Or to PAC details page
        } catch (err) {
            console.error("Erro ao registrar pagamento:", err);
            const errorMsg = err.response?.data?.message || 'Falha ao registrar pagamento.';
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingPacs) {
        return <CircularProgress />;
    }

     if (user?.role !== 'GESTOR') {
         return <Alert severity="error">Acesso não autorizado. Apenas gestores podem acessar esta página.</Alert>;
     }

    if (meusPacs.length === 0 && !loadingPacs) {
         return <Alert severity="warning">Você não está associado a nenhum PAC para registrar pagamentos.</Alert>;
    }


    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Registrar Novo Pagamento
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel id="pac-select-label">PAC</InputLabel>
                                <Select
                                    labelId="pac-select-label"
                                    id="pac-select"
                                    value={pacId}
                                    label="PAC"
                                    onChange={(e) => setPacId(e.target.value)}
                                    disabled={loadingPacs}
                                >
                                    <MenuItem value="">
                                        <em>Selecione um PAC</em>
                                    </MenuItem>
                                    {meusPacs.map((pac) => (
                                        <MenuItem key={pac.id} value={pac.id}>
                                            {pac.nome} (Província: {pac.provincia?.nome || 'N/A'})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Data do Pagamento"
                                type="date"
                                value={dataPagamento}
                                onChange={(e) => setDataPagamento(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                required
                            />
                        </Grid>
                         <Grid item xs={12} sm={6}>
                             <TextField
                                label="Comprovativo (URL)"
                                value={comprovativoUrl}
                                onChange={(e) => setComprovativoUrl(e.target.value)}
                                fullWidth
                                helperText="Insira o link para o comprovativo (upload futuro)"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Valor Pago"
                                type="number"
                                value={valorPago}
                                onChange={(e) => setValorPago(e.target.value)}
                                inputProps={{ step: "0.01" }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Valor Regularizado"
                                type="number"
                                value={valorRegularizado}
                                onChange={(e) => setValorRegularizado(e.target.value)}
                                inputProps={{ step: "0.01" }}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                             <FormControl fullWidth required>
                                <InputLabel id="mes-ref-label">Mês Referência</InputLabel>
                                <Select
                                    labelId="mes-ref-label"
                                    value={mesReferencia}
                                    label="Mês Referência"
                                    onChange={(e) => setMesReferencia(e.target.value)}
                                >
                                    {meses.map((mes) => (
                                        <MenuItem key={mes.value} value={mes.value}>
                                            {mes.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                         <Grid item xs={12} sm={6}>
                             <FormControl fullWidth required>
                                <InputLabel id="ano-ref-label">Ano Referência</InputLabel>
                                <Select
                                    labelId="ano-ref-label"
                                    value={anoReferencia}
                                    label="Ano Referência"
                                    onChange={(e) => setAnoReferencia(e.target.value)}
                                >
                                    {anos.map((ano) => (
                                        <MenuItem key={ano} value={ano}>
                                            {ano}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Observações"
                                multiline
                                rows={3}
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12}>
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={submitting || loadingPacs || !pacId}
                            >
                                {submitting ? <CircularProgress size={24} /> : 'Registrar Pagamento'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Container>
    );
}

export default RegistrarPagamento;