// Model do cabeçalho da solicitação
import mongoose from '../database/index.js';

const SolicitHeaderSchema = new mongoose.Schema({
    numOrdemServico: {
        type: String,
    },
    clienteId: { 
        type: String, 
    },
    clienteNome: {
        type: String,
    },
    centrocustoid: {
        type: String,
    },
    unidade: {
        type: String,
    },
    idDrake: {
        type: String,
        default: ""
    },
    solicitante: {
        type: String,
    },
    motivoSolicit: {
        type: String,
    },
    contrato: {
        type: String,
    },
    qtdePassageiro: {
        type: Number,
    },
    qtdeVeiculo: {
        type: Number,
    },
    qtdeMotorista: {
        type: Number,
    },
    // data/hora da viagem (agendada)
    dataViagem: {
        type: Date,
    },
    dataEfetiva: {
        type: Date,
    },
    kmPercorrido: {
        type: Number,
    },
    // qtd de pedágios
    qtdePedagio: {
        type: Number,
    },
    vlrTotalPedagio: {
        type: Number,
    },
     // qtd de estacionamentos
    qtdeEstacionamento: {
        type: Number,
    },
    vlrTotalEstacionamento: {
        type: Number,
    },
    // qtd de diárias
    qtdeDiaria: {
        type: Number,
    },
    vlrTotalDiaria: {
        type: Number,
    },    
    observacao: {
        type: String,
    },
    valorTotal: {
        type: Number,
        default: 0
    },
    // D = À definir, A = Agendado, C = Cancelado, N = No Show, P = Programado, R = Realizado
    status: {
        type: String,
    },
    userAlter: {
        type: String, 
    },
    dataAlter: {
        type: Date,
        default: Date.now,
    },
    createdUser: {
        type: String, 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const SolicitHeader = mongoose.model('SolicitHeader', SolicitHeaderSchema);

export default SolicitHeader;