import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const MotoristaSchema = new mongoose.Schema({
    nome: {
        type: String,
    },
    email: {
        type: String,
    },
    celular: {
        type: String,
    },
    cnh: {
        type: String,
    },
    cpf: {
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
    uf: {
        type: String,
    },
    complemento: {
        type: String,
    },
    cep: {
        type: String,
    },
    alocado: {
        type: Boolean,
        default: false,
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

const Motorista = mongoose.model('Motorista', MotoristaSchema);

export default Motorista;