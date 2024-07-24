import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const VeiculosSchema = new mongoose.Schema({
    montadora: {
        type: String,
    },
    modelo: {
        type: String,
    },
    ano: {
        type: Number,
    },
    tipo: {
        type: String,
    },
    placa: {
        type: String,
    },
    descricao: {
        type: String,
    },
    renavam: {
        type: String,
    },
    capacidocupa: {
        type: Number,
        default: 5,
    },
    ativo: {
        type: Boolean,
        default: true,
    },
    exibicao: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Veiculos = mongoose.model('Veiculos', VeiculosSchema);

export default Veiculos;