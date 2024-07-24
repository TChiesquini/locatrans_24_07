import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const UserClienteSchema = new mongoose.Schema({
    user: {
        type: String,
    },
    cliente: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const UserCliente = mongoose.model('UserCliente', UserClienteSchema);

export default UserCliente;