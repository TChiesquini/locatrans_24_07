import PDFDocument from 'pdfkit';
import fs from 'fs';
//
import Cliente from '../model/cliente.js';
import Motorista from '../model/motorista.js';
import SolicitHeader from '../model/solicitHeader.js';
import Passageiro from '../model/passageiro.js';

async function relSolicMotorista(dataini,datafim,motorista,nomeArquivo) {

    const mes = ["01","02","03","04","05","06","07","08","09","10","11","12"];
    const dia = ["","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15",
    "16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"];
    const dataIni = new Date(dataini);
    const dataFim = new Date(new Date(datafim).getTime() + (1439 * 60 * 1000));

    const doc = new PDFDocument({size: 'A4'});
    const hoje = new Date();
    const hojeExtenso = dia[hoje.getDate()]+'/'+mes[hoje.getMonth()]+'/'+hoje.getFullYear() + ' '+hoje.toLocaleTimeString();
    const periodo = dia[dataIni.getDate()]+'/'+mes[dataIni.getMonth()]+'/'+dataIni.getFullYear()+' até '+dia[dataFim.getDate()]+'/'+mes[dataFim.getMonth()]+'/'+dataFim.getFullYear();

    const degrau = 15;
    let linha = 85;
    const dadosFontSize = 12; 
    let y = 0;
    let z = 0;

    const outputStream = fs.createWriteStream(`./relatorio/${nomeArquivo}.pdf`);

    let clientes;
    let motoristas;
    let passageiros;
    let numOS = "";

    const dados = await SolicitHeader.aggregate([
        {'$lookup':{
            'from': 'solicitmotoristas',
            'localField': 'numOrdemServico',
            'foreignField': 'numOrdemServico',
            'as': 'sM'
        }},
        {'$lookup':{
            'from': 'solicitpassageiros',
            'localField': 'numOrdemServico',
            'foreignField': 'numOrdemServico',
            'as': 'sP'
        }},        
        {$project: {
            _id: 0,
            numOrdemServico: 1,
            dataViagem: 1,
            clienteId: 1,
            motor: '$sM.motorista_id',
            passag: '$sP'
          }},
        {"$unwind": "$motor"},
        {$match: {
        $and: [
            { dataViagem: {$gte: dataIni}},
            { dataViagem: {$lte: dataFim}},
            { motor: {$eq: motorista}},
            { status: {$eq: 'P'}},
        ]
        }},
    ]).sort({dataViagem:1});

    motoristas = await Motorista.findOne({'_id': dados[0].motor});
    
    doc.pipe(outputStream);

    // logo
    doc.image('locaimagen/logo.png', 15, 15, {width: 100});

    // Nome do relatório
    doc
        .fontSize(12)
        .text('Solicitações de '+motoristas.nome+'\n'+
        periodo, 70, 30,{
            align: 'center',
        });

    // data da geração
    doc
        .fontSize(8)
        .text(hojeExtenso, 520, 50, {width: 120});

    // linha de separação do título
    doc.moveTo(0, 60)                               
        .lineTo(620, 60)                           
        .stroke();             

    // impressão dos dados do relatório

    for(y = 0; y < dados.length; y++){

        clientes = await Cliente.findOne({'_id': dados[y].clienteId});

        if(numOS!=dados[y].numOrdemServico){
    
            numOS = dados[y].numOrdemServico;

            doc
            .fontSize(10)
            .text('Ordem de Serviço: '+dados[y].numOrdemServico+' - dia '+dados[y].dataViagem.toLocaleDateString(), 20, linha, {width: 500});

            linha += degrau;

            doc
            .fontSize(10)
            .text('Cliente: '+clientes.razao, 20, linha, {width: 500});
    
            linha += degrau;

        }
        
        for(z = 0; z < dados[y].passag.length; z++){

            passageiros = await Passageiro.findOne({'_id': dados[y].passag[z].passageiro_id});
            if(passageiros!=null){
                let celular;
                if(passageiros.celular=="" || passageiros.celular==undefined){
                    if(passageiros.phones==undefined || passageiros.phones==""){
                        celular = ""
                    }else{
                        celular = passageiros.phones
                    }
                }else{
                    celular = passageiros.celular
                }
        
                doc
                .fontSize(10)
                .text('Passageiro: '+dados[y].passag[z].passageiro_nome, 40, linha, {width: 500});
        
                linha += degrau;
        
                doc
                .fontSize(10)
                .text('Celular: '+ celular, 40, linha, {width: 300});
        
                linha += degrau;
        
                doc
                .fontSize(10)
                .text('Origem: '+dados[y].passag[z].origem, 40, linha, {width: 500});
        
                linha += degrau;
        
                doc
                .fontSize(10)
                .text('Destino: '+dados[y].passag[z].destino, 40, linha, {width: 500});
        
                linha += degrau;
        
                doc
                .fontSize(10)
                .text('Hora Saída: '+new Date(dados[y].passag[z].dataViagem.getTime() + (180 * 60 * 1000 )).toLocaleTimeString().substring(0,5)+'h', 40, linha, {width: 500});
                
                linha += degrau;
            }else{
                doc
                .fontSize(10)
                .text('Passageiro: CADASTRO NÃO ENCONTRADO', 40, linha, {width: 500});
        
                linha += degrau;                
            }


            if (linha > 730){
                linha = 85
                doc.addPage({size: 'A4'})
        
               
                doc.image('locaimagen/logo.png', 15, 15, {width: 100});
        
                
                doc
                    .fontSize(12)
                    .text('Solicitações de '+motoristas.nome+'\n'+
                    periodo, 70, 30,{
                    align: 'center',
                });
        
                
                doc
                    .fontSize(8)
                    .text(hojeExtenso, 520, 50, {width: 120});
        
                
                doc.moveTo(0, 60)                               
                    .lineTo(620, 60)                           
                    .stroke();             
        
                
                doc.moveTo(0, 80)                               
                    .lineTo(620, 80)                           
                    .stroke(); 
            }else{
                linha += degrau;
            }                                
        }

        if (linha > 730){
            linha = 85
            doc.addPage({size: 'A4'})
    
           
            doc.image('locaimagen/logo.png', 15, 15, {width: 100});
    
            
            doc
                .fontSize(12)
                .text('Solicitações de '+motoristas.nome+'\n'+
                periodo, 70, 30);
    
            
            doc
                .fontSize(8)
                .text(hojeExtenso, 520, 50, {width: 120});
    
            
            doc.moveTo(0, 60)                               
                .lineTo(620, 60)                           
                .stroke();             
    
            
            doc.moveTo(0, 80)                               
                .lineTo(620, 80)                           
                .stroke(); 
        }else{
            linha += degrau;
        }                                  
        
    };

    // Fim do PDF      
    doc.end();

    return new Promise((resolve, reject) => {
        outputStream.on('finish', () => {
        resolve();
        });

        outputStream.on('error', (error) => {
        reject(error);
        });
    });
}

export default relSolicMotorista;