// filepath: frontend/src/pages/Pagamentos/RegistrarPagamento.jsx
import React, { useState, useEffect, useRef } from 'react';
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
    Alert,
    Card,
    CardContent,
    CardHeader,
    Input
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Use the useAuth hook
import { getMeusPacs } from '../../services/pacService'; // Assuming pacService exists
import { criarPagamento } from '../../services/pagamentoService'; // Assuming pagamentoService exists
import api from '../../services/api';

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
    const [valorPago, setValorPago] = useState(''); // Only keep total valor pago
    const [mesReferencia, setMesReferencia] = useState(new Date().getMonth() + 1); // Default to current month
    const [anoReferencia, setAnoReferencia] = useState(currentYear);
    const [observacoes, setObservacoes] = useState('');
    const [comprovativoFile, setComprovativoFile] = useState(null);
    const fileInputRef = useRef(null);
    const [meusPacs, setMeusPacs] = useState([]);
    const [loadingPacs, setLoadingPacs] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user, loading: authLoading } = useAuth(); // Use auth loading guard
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPacs = async () => {
            if (!user) return;
            try {
                let list = [];
                if (user.role === 'GESTOR') {
                    const response = await getMeusPacs();
                    list = response.data || [];
                } else if (['ADMIN','SUPERVISOR'].includes(user.role)) {
                    const resp = await api.get('/pacs');
                    list = resp.data || [];
                }
                setMeusPacs(list);
            } catch (err) {
                console.error("Erro ao buscar PACs:", err);
                setError('Falha ao carregar PACs.');
            } finally {
                setLoadingPacs(false);
            }
        };
         
        fetchPacs();
    }, [user]); // Re-run if user context changes

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
             if (file.size <= 5 * 1024 * 1024) { // 5MB limit (opcional, mas bom ter)
                setComprovativoFile(file);
                setError(''); // Limpar erro de arquivo
             } else {
                setError('Arquivo muito grande. O limite é 5MB.');
                setComprovativoFile(null); // Limpar seleção
                event.target.value = null; // Resetar input
             }
        } else {
            setError('Tipo de arquivo inválido. Selecione PDF ou Imagem (JPG, PNG).');
            setComprovativoFile(null); // Limpar seleção
            event.target.value = null; // Resetar input
        }
    };

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

        // Criar FormData
        const formData = new FormData();
        formData.append('pac_id', pacId);
        formData.append('data_pagamento', dataPagamento);
        formData.append('valor_pago', valorPago || 0); // Send only the total amount paid
        formData.append('mes_referencia', mesReferencia);
        formData.append('ano_referencia', anoReferencia);
        formData.append('observacoes', observacoes);

        // Adicionar o arquivo se ele existir
        if (comprovativoFile) {
            formData.append('comprovativo', comprovativoFile); // Nome do campo deve ser 'comprovativo'
        }

        try {
            // Chamar o serviço atualizado que envia FormData
            const response = await criarPagamento(formData);
            setSuccess(`Pagamento para o PAC ${response.data?.pac?.nome} registrado com sucesso! Status de confirmação: PENDENTE.`);
            // Resetar campos e arquivo após sucesso
            setValorPago(''); // Reset valor pago
            setObservacoes('');
            setComprovativoFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = null; // Limpar o input de arquivo
            }
            // navigate('/pagamentos');
        } catch (err) {
            console.error("Erro ao registrar pagamento:", err);
            const errorMsg = err.response?.data?.message || 'Falha ao registrar pagamento.';
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loadingPacs) {
        return (
            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                 <CircularProgress />
            </Container>
        );
    }

     if (user?.role !== 'GESTOR' && user?.role !== 'ADMIN' && user?.role !== 'SUPERVISOR') {
         return (
             <Container sx={{ mt: 4 }}>
                 <Alert severity="error">Acesso não autorizado. Apenas gestores, administradores ou supervisores podem acessar esta página.</Alert>
             </Container>
         );
     }

    if (user.role === 'GESTOR' && meusPacs.length === 0 && !loadingPacs) {
         return (
             <Container sx={{ mt: 4 }}>
                 <Alert severity="warning">Você não está associado a nenhum PAC para registrar pagamentos.</Alert>
             </Container>
         );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Card>
                <CardHeader
                    title="Registrar Novo Pagamento"
                    action={
                        <Button onClick={() => navigate('/pagamentos')} variant="outlined">
                            Voltar para Lista
                        </Button>
                    }
                />
                <CardContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth required variant="outlined">
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
                                    variant="outlined"
                                />
                            </Grid>

                            {/* Campo de Upload de Comprovativo */}
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined">
                                    {/* Input escondido */}
                                    <Input
                                        type="file"
                                        id="comprovativo-upload"
                                        inputRef={fileInputRef} // Associar ref
                                        onChange={handleFileChange}
                                        sx={{ display: 'none' }}
                                        inputProps={{ accept: "image/*,application/pdf" }} // Aceitar imagens e PDF
                                    />
                                    {/* Botão que ativa o input */}
                                    <label htmlFor="comprovativo-upload">
                                        <Button
                                            variant="outlined"
                                            component="span" // Faz o botão agir como label
                                            fullWidth
                                            sx={{ height: '56px' }} // Altura padrão do TextField outlined
                                        >
                                            {comprovativoFile ? `Arquivo: ${comprovativoFile.name}` : 'Carregar Comprovativo'}
                                        </Button>
                                    </label>
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        (PDF ou Imagem, máx 5MB)
                                    </Typography>
                                </FormControl>
                            </Grid>

                            {/* Campo Valor Pago (Total) */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Valor Pago (MZN)" // Simplified label
                                    type="number"
                                    value={valorPago}
                                    onChange={(e) => setValorPago(e.target.value)}
                                    inputProps={{ step: "0.01", min: "0" }}
                                    fullWidth
                                    variant="outlined"
                                    required // Make it required if a payment must have a value
                                />
                            </Grid>

                            {/* Mês/Ano Referência - Spanning more columns now */}
                            <Grid item xs={12} sm={6}>
                                 <FormControl fullWidth required variant="outlined">
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
                                 <FormControl fullWidth required variant="outlined">
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
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/pagamentos')}
                                    disabled={submitting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={submitting || loadingPacs || !pacId}
                                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                                >
                                    {submitting ? 'Registrando...' : 'Registrar Pagamento'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
}

export default RegistrarPagamento;