import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const ClienteSchema = new mongoose.Schema({
    razao: {
        type: String,
    },
    fantasia: {
        type: String,
    },
    cnpj: {
        type: String,
    },
    cpf: {
        type: String,
    },
    cep: {
        type: String,
    },
    endereco: {
        type: String,
    },
    complemento: {
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
    ativo: {
        type: Boolean,
        default: true,
    },
    contato: {
        type: String,
    },
    email: {
        type: String,
    },
    celular1: {
        type: String,
    },
    celular2: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Cliente = mongoose.model('Cliente', ClienteSchema);

export default Cliente;