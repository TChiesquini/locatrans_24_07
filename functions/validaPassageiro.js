import Passageiro from '../model/passageiro.js';
import validaCentroCusto from './validaCentroCusto.js';
import validaTrajeto from "./validaTrajeto.js";

//referencia,nome,identify,phones
async function validaPassageiro(participante) {

    let passageiro;
    let dados = [];
    let centrodeCusto;
    let trajeto;
    let valorTotal = 0;
    let i;
    let todosValores = true;
    let idDrake = [];

    for(i = 0; i < participante.length; i++) {
        try{
            passageiro = await Passageiro.findOne({'idDrake': participante[i].Participant.DrakeId});

            if(passageiro==null) {
                passageiro = await Passageiro.create({
                    nome: participante[i].Participant.Name,
                    identify: participante[i].Participant.Identity,
                    phones: participante[i].Participant.Details[2].value,
                    idDrake: participante[i].Participant.DrakeId
                })
            }

            centrodeCusto = await validaCentroCusto(participante[i].Details[1].Value,participante[i].Details[0].Value);
            trajeto = await validaTrajeto(participante[i].Origin.Id,participante[i].Origin.Name,participante[i].Destination.Id,participante[i].Destination.Name);    

            if(trajeto.valor==0 || trajeto.valor==null){
                todosValores = false;
            }
            // gravar valor total da viagem, desconsiderando soma se o trajeto for igual
            if(idDrake.find((element) => element = trajeto._id)){
                valorTotal += 0;
            }else{
                valorTotal += trajeto.valor;
            }
            idDrake.push(trajeto._id);

            dados.push({passageiro: passageiro,trajeto: trajeto,centrodeCusto: centrodeCusto,total: valorTotal});

        }catch{

        }
    }

    return {dados,todosValores};

}

export default validaPassageiro;