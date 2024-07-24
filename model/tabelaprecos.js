import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const TabelaSchema = new mongoose.Schema({
    cliente: {
        type: String,
    },
    contrato: {
        type: String,
    },
    trajeto: {
        type: String,
    },
    tipoveiculo: {
        type: String,
    },
    valor: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Tabela = mongoose.model('Tabela', TabelaSchema);

export default Tabela;