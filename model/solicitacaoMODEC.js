import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const SolicMODECSchema = new mongoose.Schema({
    cliente: {
        type: String,
    },
    // Id Drake
    idSolicitacao: {
        type: String,
    },
    // SenderUserName
    solicitante: {
        type: String,
    },
    data: {
        type: Date,
    },
    dataViagem: {
        type: Date,
    },
    descricao: {
        type: String,
    },
    qtdePassageiro: {
        type: Number,
    },
    passageiro: {
        type: Array,
    },
    passageiroid: {
        type: String,
    },
    passageironome: {
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
    painel: {
        type: Array,
    },
    veiculo: {
        type: String,
    },
    motorista: {
        type: String,
    },
    centrocustoid: {
        type: String,
    },
    centrocustonome: {
        type: String,
    },
    // I = Incluído, A = Aprovado, N = Negado, R = Em Análise
    status: {
        type: String,
        default: "R",
    },
    valor: {
        type: Number,
        default: 0
    },
    userAlter: {
        type: String, 
    },
    dataAlter: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const SolicMODEC = mongoose.model('SolicMODEC', SolicMODECSchema);

export default SolicMODEC;