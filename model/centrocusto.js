import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const CCustoSchema = new mongoose.Schema({
    descricao: {
        type: String,
    },
    // campo para identificar o mesmo registro no cadastro do cliente Locatrans
    codigo: {
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

const CCusto = mongoose.model('CCusto', CCustoSchema);

export default CCusto;