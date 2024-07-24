import Trajeto from '../model/trajeto.js';

async function validaTrajeto(idOrigem,origem,idDestino,destino) {
    let trajeto = await Trajeto.findOne({'idDrakeOrigem': idOrigem,'idDrakeDestino': idDestino});

    if(trajeto==null) {
        trajeto = await Trajeto.create({
            descricao: origem +' para '+destino,
            origem: origem,
            destino: destino,
            idDrakeOrigem: idOrigem,
            idDrakeDestino: idDestino,
        })
    }

    return trajeto;

}

export default validaTrajeto;