import CCusto from '../model/centrocusto.js';

async function validaCentroCusto(descricao,referencia) {
    let ccusto = await CCusto.findOne({'codigo': referencia});

    if(ccusto==null) {
        ccusto = await CCusto.create({
            descricao: descricao,
            codigo: referencia
        })
    }

    return ccusto;

}

export default validaCentroCusto;