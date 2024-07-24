// Model com os dados de Veículo(s) e Motorista(s) usados na viagem
import mongoose from '../database/index.js';

const SolicitMotoristaSchema = new mongoose.Schema({
    numOrdemServico: {
        type: String,
    },
    motorista_id: {
        type: String,
    },
    motorista_nome: {
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

const SolicitMotorista = mongoose.model('SolicitMotorista', SolicitMotoristaSchema);

export default SolicitMotorista;