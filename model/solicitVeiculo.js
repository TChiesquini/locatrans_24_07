// Model com os dados de Veículo(s) e Motorista(s) usados na viagem
import mongoose from '../database/index.js';

const SolicitVeiculoSchema = new mongoose.Schema({
    numOrdemServico: {
        type: String,
    },
    veiculo_id: {
        type: String,
    },
    veiculo_modelo: {
        type: String,
    },
    veiculo_tipo: {
        type: String,
    },
    veiculo_placa: {
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

const SolicitVeiculo = mongoose.model('SolicitVeiculo', SolicitVeiculoSchema);

export default SolicitVeiculo;