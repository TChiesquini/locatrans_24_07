// Model dos dados relacionados ao Passageiro
import mongoose from '../database/index.js';

const SolicitPassageiroSchema = new mongoose.Schema({
    numOrdemServico: {
        type: String,
    },
    // data/hora da viagem (agendada)
    dataViagem: {
        type: Date,
    },
    // data/hora do realizado
    realizado: {
        type: Date,
        default: Date.now
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
    trajetoId: {
        type: String,
    },
    trajeto: {
        type: Number,
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
    // D = À definir, A = Agendado, C = Cancelado, N = No Show, P = Programado, R = Realizado
    status: {
        type: String,
        default: "A"
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

const SolicitPassageiro = mongoose.model('SolicitPassageiro', SolicitPassageiroSchema);

export default SolicitPassageiro;