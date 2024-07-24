import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const LocalSchema = new mongoose.Schema({
    descricao: {
        type: String
    },
    cep: {
        type: String,
    },
    endereco: {
        type: String,
    },
    bairro: {
        type: String,
    },
    municipio: {
        type: String,
    },
    complemento: {
        type: String,
    },
    uf: {
        type: String,
    },
    ativo: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Local = mongoose.model('Local', LocalSchema);

export default Local;