import SolicitPassageiro from "../model/solicitPassageiro.js";
import SolicitMotorista from "../model/solicitMotorista.js";
import SolicitVeiculo from "../model/solicitVeiculo.js";
import SolicitTrajeto from "../model/solicitTrajeto.js";
import SolicitHeader from "../model/solicitHeader.js";

import Config from "../model/configuracao.js";

async function salvarSolicitacao(dados) {

    const header = dados.header;
    const passageiro = dados.passageiro;
    const motorista = dados.motorista;
    const veiculo = dados.veiculo;
    const trajeto = dados.trajeto;

    let passageiros = [];
    let motoristas = [];
    let veiculos = [];
    let trajetos = [];
    let trajetosId = [];
    let trajetosolic;
    let passSolic;
    let motorSolic;
    let veicuSolict;

    let i = 0;

    //2024-01-22T19:23:00Z - banco
    //2024-01-22 16:23:00.000 dart
    // existe uma diferença de 3h na hora de salvar, a linha abaixo ajusta a diferença
    let newData = new Date(new Date(header.dataViagem).getTime() - (180 * 60 * 1000 ));
    header.dataViagem = newData;

    const configs = await Config.find();
    if(configs[0].numOrdemServicoAno!=new Date().getUTCFullYear().toString()){
      // altero o ano da ordem de servico e reinicia a numeraçao
      await Config.updateMany({$set: {numOrdemServico: "000000",numOrdemServicoAno: new Date().getUTCFullYear().toString()}});
    }
    const numOrdemServico = ("000000" + (parseInt(configs[0].numOrdemServico)+1)).slice(-6);   

    // altero o numero do orçamento para um a mais
    await Config.updateMany({$set: {numOrdemServico: numOrdemServico}});
    
    header.numOrdemServico = numOrdemServico+'/'+configs[0].numOrdemServicoAno;

    const headerSolicit = await SolicitHeader.create(header);

    for(i = 0; i < trajeto.length; i++){

        trajetos = [];
        trajetos.push({
            "numOrdemServico": numOrdemServico+'/'+configs[0].numOrdemServicoAno,
            "trajeto_id": trajeto[i]._id,
            "trajeto_descricao": trajeto[i].descricao,
            "trajeto_origem": trajeto[i].origem,
            "trajeto_destino": trajeto[i].destino
        })

        trajetosolic = await SolicitTrajeto.create(trajetos[0]);
        trajetosId.push({
            "indice": i,
            "id": trajetosolic._id
        })
    }

    for(i = 0; i < passageiro.length; i++){

        passageiros = [];
        passageiros.push({
            "numOrdemServico": numOrdemServico+'/'+configs[0].numOrdemServicoAno,
            "dataViagem": header.dataViagem,
            "passageiro_id": passageiro[i]._id,
            "passageiro_nome": passageiro[i].nome,
            "passageiro_celular": passageiro[i].celular,
            "trajetoId": trajetosId[passageiro[i].trajeto].id,
            "origem": trajeto[passageiro[i].trajeto].origem,
            "destino": trajeto[passageiro[i].trajeto].destino
        })

        passSolic = await SolicitPassageiro.create(passageiros);
    }

    for(i = 0; i < motorista.length; i++){

        motoristas = [];
        motoristas.push({
            "numOrdemServico": numOrdemServico+'/'+configs[0].numOrdemServicoAno,
            "motorista_id": motorista[i]._id,
            "motorista_nome": motorista[i].nome
        })

        motorSolic = await SolicitMotorista.create(motoristas);
    }

    for(i = 0; i < veiculo.length; i++){

        veiculos = [];
        veiculos.push({
            "numOrdemServico": numOrdemServico+'/'+configs[0].numOrdemServicoAno,
            "veiculo_id": veiculo[i]._id,
            "veiculo_modelo": veiculo[i].modelo,
            "veiculo_tipo": veiculo[i].tipo,
            "veiculo_placa": veiculo[i].placa
        })

        veicuSolict = await SolicitVeiculo.create(veiculos);
    }

    return headerSolicit;
}

export default salvarSolicitacao;