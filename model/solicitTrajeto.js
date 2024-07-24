// Model com os dados de Veículo(s) e Motorista(s) usados na viagem
import mongoose from '../database/index.js';

const SolicitTrajetoSchema = new mongoose.Schema({
    numOrdemServico: {
        type: String,
    },
    trajeto_id: {
        type: String,
    },
    trajeto_descricao: {
        type: String,
    },
    trajeto_origem: {
        type: String,
    },
    trajeto_destino: {
        type: String,
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

const SolicitTrajeto = mongoose.model('SolicitTrajeto', SolicitTrajetoSchema);

export default SolicitTrajeto;