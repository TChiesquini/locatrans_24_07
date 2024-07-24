import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const SolicitacaoSchema = new mongoose.Schema({
    numOrdemServico: {
        type: String,
    },
    cliente: { 
        type: String, 
    },
    cliente_nome: {
        type: String,
    },
    idDrake: {
        type: String,
        default: ""
    },
    solicitante: {
        type: String,
    },
    contrato: {
        type: String,
    },
    // data/hora da viagem (agendada)
    data: {
        type: Date,
    },
    // data/hora do realizado
    realizado: {
        type: Date,
    },
    kmpercorrido: {
        type: Number,
    },
    // qtd de pedágios
    qtdepedagio: {
        type: Number,
    },
    vrtotalpedagio: {
        type: Number,
    },
     // qtd de estacionamentos
    qtdeestacionamento: {
        type: Number,
    },
    vrtotalestacionamento: {
        type: Number,
    },
    // qtd de diárias
    qtdediaria: {
        type: Number,
    },
    vrtotaldiaria: {
        type: Number,
    },    
    descricao: {
        type: String,
    },
    veiculo: {
        type: String, 
    },
    veiculo_modelo: {
        type: String,
    },
    veiculo_placa: {
        type: String,
    },
    motorista: {
        type: String, 
    },
    motorista_nome: {
        type: String,
    },
    passageiro_id: {
        type: String
    },
    passageiro_nome: {
        type: String,
    },
    passageiro_celular: {
        type: String,
    },
    trajeto: {
        type: String,
    },
    origem: {
        type: String,
    },
    destino: {
        type: String,
    },
    centrocustoid: {
        type: String,
        default: ""
    },
    centrocustonome: {
        type: String,
        default: ""
    },
    valorTrajeto: {
        type: Number,
        default: 0
    },
    valorRateio: {
        type: Number,
        default: 0
    },
    total: {
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

const Solicitacao = mongoose.model('Solicitacao', SolicitacaoSchema);

export default Solicitacao;