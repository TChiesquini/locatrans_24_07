import SolicitPassageiro from "../model/solicitPassageiro.js";
import SolicitMotorista from "../model/solicitMotorista.js";
import SolicitVeiculo from "../model/solicitVeiculo.js";
import SolicitTrajeto from "../model/solicitTrajeto.js";
import SolicitHeader from "../model/solicitHeader.js";

async function alterarSolicitacao(dados) {

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
    let resultTrajeto = [];
    let newData = ''

    let i = 0;

    //2024-01-22T19:23:00Z - banco
    //2024-01-22 16:23:00.000 dart
    // existe uma diferença de 3h na hora de salvar, a linha abaixo ajusta a diferença
    if(header.dataViagem.slice(-1)!='Z'){
        newData = new Date(new Date(header.dataViagem).getTime() - (180 * 60 * 1000 ));
        header.dataViagem = newData;
    }
    

    if(header.vlrTotalDiaria=='null'){
        header.vlrTotalDiaria = 0
    }else{
        header.vlrTotalDiaria = parseFloat(header.vlrTotalDiaria)
    }

    if(header.vlrTotalEstacionamento=='null'){
        header.vlrTotalEstacionamento = 0
    }else{
        header.vlrTotalEstacionamento = parseFloat(header.vlrTotalEstacionamento)
    }

    if(header.vlrTotalPedagio=='null'){
        header.vlrTotalPedagio = 0
    }else{
        header.vlrTotalPedagio = parseFloat(header.vlrTotalPedagio)
    }

    if(header.idDrake!='null'){
        header.idDrake = parseInt(header.idDrake)
    }
    if(header.kmPercorrido=='null'){
        header.kmPercorrido = 0
    }else{
        header.kmPercorrido = parseFloat(header.kmPercorrido)
    }

    if(header.valorTotal=='null'){
        header.valorTotal = 0
    }else{
        header.valorTotal = parseFloat(header.valorTotal)
    }

    if(header.qtdeDiaria=='null'){
        header.qtdeDiaria = 0
    }else{
        header.qtdeDiaria = parseInt(header.qtdeDiaria)
    }

    if(header.qtdeEstacionamento=='null'){
        header.qtdeEstacionamento = 0
    }else{
        header.qtdeEstacionamento = parseInt(header.qtdeEstacionamento)
    }

    if(header.qtdeMotorista=='null'){
        header.qtdeMotorista = 0
    }else{
        header.qtdeMotorista = parseInt(header.qtdeMotorista)
    }

    if(header.qtdePassageiro=='null'){
        header.qtdePassageiro = 0
    }else{
        header.qtdePassageiro = parseInt(header.qtdePassageiro)
    }

    if(header.qtdePedagio=='null'){
        header.qtdePedagio = 0
    }else{
        header.qtdePedagio = parseInt(header.qtdePedagio)
    }

    if(header.qtdeVeiculo=='null'){
        header.qtdeVeiculo = 0
    }else{
        header.qtdeVeiculo = parseInt(header.qtdeVeiculo)
    }

    const headerSolicit = await SolicitHeader.updateOne({'_id': header._id}, {$set: header});

    // Trajeto
    let resposta = await SolicitTrajeto.deleteMany({"numOrdemServico": header.numOrdemServico});
    for(i = 0; i < trajeto.length; i++){

        trajetos = [];
        //let idTrajeto = trajeto[i]._id;

        //let resposta = await SolicitTrajeto.find({"_id": idTrajeto});

        //if(resposta.length == 0){
            trajetos.push({
                "numOrdemServico": header.numOrdemServico,
                "trajeto_id": trajeto[i].ativo==undefined ? trajeto[i].trajeto_id : trajeto[i]._id,
                "trajeto_descricao": trajeto[i].descricao,
                "trajeto_origem": trajeto[i].origem,
                "trajeto_destino": trajeto[i].destino
                })
            resultTrajeto = await SolicitTrajeto.create(trajetos[0]);
        // }
        // else{
        //     trajetos.push({
        //         "numOrdemServico": header.numOrdemServico,
        //         "trajeto_id": trajeto[i].trajeto_id,
        //         "trajeto_descricao": trajeto[i].descricao,
        //         "trajeto_origem": trajeto[i].origem,
        //         "trajeto_destino": trajeto[i].destino
        //     })
        //     delete trajeto[i]._id;
        //     resultTrajeto = await SolicitTrajeto.updateOne({"_id": idTrajeto}, {$set: trajetos[0]});
        // }
        trajetosId.push({
            "indice": i,
            "id": resultTrajeto._id
        })

    }
    
    // Passageiro
    resposta = await SolicitPassageiro.deleteMany({"numOrdemServico": header.numOrdemServico});
    let _trajeto;
    for(i = 0; i < passageiro.length; i++){

        passageiros = [];
        _trajeto = -1;
        //let idPassageiro = passageiro[i]._id;
        //let resposta = await SolicitPassageiro.find({"_id": idPassageiro});
        if(passageiro[i].trajeto < 0){
            _trajeto = trajeto.findIndex((tr) => {return tr.trajeto_id == passageiro[i].trajetoId})
        }


        //if(resposta.length == 0){
            passageiros.push({
                "numOrdemServico": header.numOrdemServico,
                "dataViagem": header.dataViagem,
                "passageiro_id": passageiro[i]._id,
                "passageiro_nome": passageiro[i].nome,
                "passageiro_celular": passageiro[i].celular,
                "trajetoId": _trajeto>-1 ? trajetosId[_trajeto].id : trajetosId[passageiro[i].trajeto].id,
                "origem":  _trajeto>-1 ? trajeto[_trajeto].origem : trajeto[passageiro[i].trajeto].origem,
                "destino": _trajeto>-1 ? trajeto[_trajeto].destino : trajeto[passageiro[i].trajeto].destino
            })
            //"trajetoId": trajeto[passageiro[i].trajeto].trajeto_id,
            await SolicitPassageiro.create(passageiros[0])
        //}
        //else{
        //     passageiros.push({
        //         "numOrdemServico": header.numOrdemServico,
        //         "dataViagem": header.dataViagem,
        //         "passageiro_id": passageiro[i].passageiro_id,
        //         "passageiro_nome": passageiro[i].nome,
        //         "passageiro_celular": passageiro[i].celular,
        //     })

        //     delete passageiro[i]._id;
        //     await SolicitPassageiro.updateOne({"_id": idPassageiro}, {$set: passageiros[0]});

        // }
     
    }

    resposta = await SolicitMotorista.deleteMany({"numOrdemServico": header.numOrdemServico});
    for(i = 0; i < motorista.length; i++){

        motoristas = [];
        let idMotorista = motorista[i]._id;
        motoristas.push({
            "numOrdemServico": header.numOrdemServico,
            "motorista_id": motorista[i].motorista_id,
            "motorista_nome": motorista[i].nome
        })

        //let resposta = await SolicitMotorista.find({"_id": idMotorista});

        //if(resposta.length == 0)
            await SolicitMotorista.create(motoristas[0]);
        // else{
        //     delete motorista[i]._id;
        //     await SolicitMotorista.updateOne({"_id": idMotorista}, {$set: motoristas[0]});
        // }

    }

    resposta = await SolicitVeiculo.deleteMany({"numOrdemServico": header.numOrdemServico});
    for(i = 0; i < veiculo.length; i++){

        veiculos = [];
        let idVeiculo = veiculo[i]._id;
        veiculos.push({
            "numOrdemServico": header.numOrdemServico,
            "veiculo_id": veiculo[i].veiculo_id,
            "veiculo_modelo": veiculo[i].modelo,
            "veiculo_tipo": veiculo[i].tipo,
            "veiculo_placa": veiculo[i].placa
        })

        //let resposta = await SolicitVeiculo.find({"_id": idVeiculo});

        //if(resposta.length == 0)
            await SolicitVeiculo.create(veiculos[0]);
        // else{
        //     delete veiculo[i]._id;
        //     await SolicitVeiculo.updateOne({"_id": idVeiculo}, {$set: veiculos[0]});
        // }
     
    }

    return headerSolicit;
}

export default alterarSolicitacao;