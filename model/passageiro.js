import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const PassageiroSchema = new mongoose.Schema({
    nome: {
        type: String,
    },
    email: {
        type: String,
    },
    celular: {
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
    cliente: {
        type: Array,
    },
    ativo: {
        type: Boolean,
        default: true,
    },
    idDrake: {
        type: String,
    },
    phones: {
        type: String,
    },
    identify: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Passageiro = mongoose.model('Passageiro', PassageiroSchema);

export default Passageiro;