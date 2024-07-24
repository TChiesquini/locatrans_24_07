import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const ConfigSchema = new mongoose.Schema({

    producao: {
        type: Boolean,
        default: false, 
    },
    numOrdemServico: {
        type: String,
    },
    numOrdemServicoAno: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Config = mongoose.model('Config', ConfigSchema);

export default Config;