import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const TrajetoSchema = new mongoose.Schema({
    descricao: {
        type: String,
        default: ""
    },
    origem: {
        type: String,
    },
    origemId: {
        type: String,
    },
    destino: {
        type: String,
    },
    destinoId: {
        type: String,
    },
    kmpercorrido: {
        type: Number,
        default: 0
    },
    qtdepedagio: {
        type: Number,
        default: 0
    },
    ativo: {
        type: Boolean,
        default: true,
    },
    idDrakeOrigem: {
        type: String,
        default: ""
    },
    idDrakeDestino: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Trajeto = mongoose.model('Trajeto', TrajetoSchema);

export default Trajeto;