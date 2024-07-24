//const mongoose = require(`${__dir}/database`);
import mongoose from '../database/index.js';

const MessageSchema = new mongoose.Schema({
    datain: {
        type: String,
    },
    horain: {
        type: String,
    },
    titulo: {
        type: String,
    },
    corpo: {
        type: String,
    },
    descricao: {
        type: String,
    },
    lido: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model('Message', MessageSchema);

export default Message;