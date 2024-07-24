import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const ContratoSchema = new mongoose.Schema({
    cliente: {
        type: String,
    },
    objeto: {
        type: String,
    },
    datainiciovigencia: {
        type: String,
    },
    datafimvigencia: {
        type: String,
    },
    responsavel: {
        type: String,
    },
    email: {
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

const Contrato = mongoose.model('Contrato', ContratoSchema);

export default Contrato;