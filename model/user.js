import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    cliente: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
        default: '123'
    },
    nome: {
        type: String,
    },
    celular: {
        type: String,
    },
    // A = Administrador, L = Logistica, C = Cliente, F = Financeiro
    nivel: {
        type: String,
    },
    ativo: {
        type: Boolean,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

UserSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();    
});

const User = mongoose.model('User', UserSchema);

export default User;