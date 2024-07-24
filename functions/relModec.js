import xl from 'excel4node';
import fs from 'fs';
import Cliente from '../model/cliente.js';
import CCusto from '../model/centrocusto.js';
import Motorista from '../model/motorista.js';
import Veiculo from '../model/veiculos.js';
import SolicitHeader from '../model/solicitHeader.js';

async function relModec(acesso,dataini,datafim,cliente) {

  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Solicitações');
  const acessar = acesso;
  const dataIni = new Date(dataini);
  const dataFim = new Date(new Date(datafim).getTime() + (1439 * 60 * 1000));
  let data = [];
  let dados;
  //let empresa;
  //let ccusto;
  //let motorista;
  //let veiculo;
  let y = 0;
  let z = 0;
  let filtroCliente;
  let clienteModec = false;
  const mes = ["01","02","03","04","05","06","07","08","09","10","11","12"];
  const dia = ["","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15",
  "16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"]

  let cores = {
    1: '#ffafaa',
    2: '#ffeac5',
    3: '#fff7b9',
    4: '#f7ffaa',
    5: '#e5ff9a',
    6: '#d4ffa2',
    7: '#aaffb8',
    8: '#a7ffdf',
    9: '#84f5ff',
   10: '#94ddff',
   11: '#85b2ff',
   12: '#94a7ff',
   13: '#8881ff',
   14: '#b895ff',
   15: '#fe8dff',
   16: '#ff89e5',
   17: '#ff92be',
   18: '#ffa5ac',
   19: '#ffafaa',
   20: '#ffeac5',
   21: '#fff7b9',
   22: '#f7ffaa',
   23: '#e5ff9a',
   24: '#d4ffa2',
   25: '#aaffb8',
   26: '#a7ffdf',
   27: '#84f5ff',
   28: '#94ddff',
   29: '#85b2ff',
   30: '#94a7ff',
   31: '#8881ff',
  };

  var style = wb.createStyle({
    font: {
      color: '#000000',
      size: 12,
    },
    border: {
      outline: true,
    },
    numberFormat: 'R$#,##0.00; (R$#,##0.00); -',
  });

  if(cliente==null){
    dados = await SolicitHeader.aggregate([
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
      {'$lookup':{
        'from': 'solicitveiculos',
        'localField': 'numOrdemServico',
        'foreignField': 'numOrdemServico',
        'as': 'sV'
      }}, 
      {'$lookup':{
        'from': 'solicittrajetos',
        'localField': 'numOrdemServico',
        'foreignField': 'numOrdemServico',
        'as': 'sT'
      }}, 
      {$project: {
          dataViagem: 1,
          clienteId: 1,
          centrocustoid: 1,
          solicitante: 1,
          qtdePassageiro: 1,
          numOrdemServico: 1,
          observacao: 1,
          valorTotal: 1,
          motor: '$sM',
          passag: '$sP',
          veic: '$sV',
          traj: '$sT'
        }},
      {$match: {
      $and: [
          { dataViagem: {$gte: dataIni}},
          { dataViagem: {$lte: dataFim}},
      ]
      }},
    ]).sort({dataViagem:1}); 
  }else{
    filtroCliente = await Cliente.findOne({'_id': cliente});
    if(filtroCliente.fantasia.includes("MODEC") || filtroCliente.fantasia.includes("Modec")){
      clienteModec = true;
    }
    dados = await SolicitHeader.aggregate([
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
      {'$lookup':{
        'from': 'solicitveiculos',
        'localField': 'numOrdemServico',
        'foreignField': 'numOrdemServico',
        'as': 'sV'
      }}, 
      {'$lookup':{
        'from': 'solicittrajetos',
        'localField': 'numOrdemServico',
        'foreignField': 'numOrdemServico',
        'as': 'sT'
      }}, 
      {$project: {
          dataViagem: 1,
          clienteId: 1,
          centrocustoid: 1,
          solicitante: 1,
          qtdePassageiro: 1,
          numOrdemServico: 1,
          observacao: 1,
          valorTotal: 1,
          unidade: 1,
          motor: '$sM',
          passag: '$sP',
          veic: '$sV',
          traj: '$sT'
        }},
      {$match: {
      $and: [
          { dataViagem:     {$gte: dataIni}},
          { dataViagem:     {$lte: dataFim}},
          { clienteId:      {$eq: cliente}},
      ]
      }},
    ]).sort({dataViagem:1}); 
  }

  let numOs;
  for(y = 0; y < dados.length; y++){
    
    let motorista = '';
    let veiculo = '';
    let placa = '';
    let passageiro = '';
    let origem = '';
    let destino = '';
    let empresa;
    let ccusto;

    empresa = await Cliente.findOne({'_id': dados[y].clienteId});

    if(dados[y].centrocustoid!='null' && dados[y].centrocustoid!=undefined){
      ccusto = await CCusto.findOne({'_id': dados[y].centrocustoid});
    }

    if(dados[y].motor.length>0){
      for(z = 0; z < dados[y].motor.length; z++){
        motorista = motorista + dados[y].motor[z].motorista_nome+'|'
      }
    }
    if(dados[y].veic.length>0){
      for(z = 0; z < dados[y].veic.length; z++){
        veiculo = veiculo + dados[y].veic[z].veiculo_tipo+'|'+dados[y].veic[z].veiculo_modelo+'|'
        placa = placa + dados[y].veic[z].veiculo_placa+'|'
      }
    }
    if(dados[y].passag.length>0){
      for(z = 0; z < dados[y].passag.length; z++){
        passageiro = passageiro + dados[y].passag[z].passageiro_nome+'|'
      }
    }
    if(dados[y].traj.length>0){
      for(z = 0; z < dados[y].traj.length; z++){
        origem = origem + dados[y].traj[z].trajeto_origem+'|'
        destino = destino + dados[y].traj[z].trajeto_destino+'|'
      }
    }

    data.push({
      "Nome": passageiro,
      "Empresa": empresa.fantasia,
      "Unidade": dados[y].unidade,
      "Solicitante": dados[y].solicitante,
      "Data": dados[y].dataViagem.toLocaleDateString(),
      "Hora": new Date(dados[y].dataViagem.getTime() + (180 * 60 * 1000 )).toLocaleTimeString().substring(0,5)+'h',
      "De (Origem)": origem,
      "Para (Destino)": destino,
      "Centro de Custo": dados[y].centrocustoid!='null' && dados[y].centrocustoid!=undefined ? ccusto.codigo+' '+ccusto.descricao : "",
      "ID": "",
      "Valor por Passageiro": acessar=="true" && dados[y].qtdePassageiro>0 ? dados[y].valorTotal/dados[y].qtdePassageiro : 0,
      "Valor Total": acessar=="true" & dados[y].numOrdemServico!=numOs ? dados[y].valorTotal : 0,
      "Referencia": dados[y].numOrdemServico==numOs ? '-' : dados[y].numOrdemServico,
      "Status": "",
      "Veiculo": veiculo,
      "Motorista": motorista,
      "Placa": placa,
      "Observacoes": ""
    }
    )
    numOs = dados[y].numOrdemServico;
  
  }

  const headingColumnNames = [
      "Nome",
      "Empresa",
      "Unidade",
      "Solicitante",
      "Data",
      "Hora",
      "De (Origem)",
      "Para (Destino)",
      "Centro de Custo",
      "ID",
      "Valor por Passageiro",
      "Valor Total",
      "Referencia",
      "Status",
      "Veiculo",
      "Motorista",
      "Placa",
      "Observacoes"
  ]

  ws.row(1).setHeight(50);
  ws.row(2).setHeight(50);
  ws
  .cell(1, 1, 2, headingColumnNames.length, true)
  .string(
    'Logistics Service Request\n'+
    dia[dataIni.getDate()]+'/'+mes[dataIni.getMonth()]+'/'+dataIni.getFullYear()+' até '+dia[dataFim.getDate()]+'/'+mes[dataFim.getMonth()]+'/'+dataFim.getFullYear()
    )
  .style(
    {alignment: {
    wrapText: true,
    horizontal: 'center',
    vertical: 'center',
    }},
    {font: {
      bold: true,
      size: 22,
    }}
  );

  if(clienteModec){
    ws.addImage({
      path: './locaimagen/logo_modec.png',
      type: 'picture',
      position: {
        type: 'absoluteAnchor',
        from: {
          x: '1in',
          y: '2in',
        },
      },
    });
  }else{
    ws.addImage({
      path: './locaimagen/logo.png',
      type: 'picture',
      position: {
        type: 'absoluteAnchor',
        from: {
          x: '1in',
          y: '2in',
        },
      },
    });
  }


  let headingColumnIndex = 1; //diz que começará na primeira linha
  headingColumnNames.forEach(heading => { //passa por todos itens do array
      // cria uma célula do tipo string para cada título
      ws.cell(3, headingColumnIndex++).string(heading);
  });
   
  let rowIndex = 4;
  data.forEach( record => {
      let columnIndex = 1;
      Object.keys(record).forEach(columnName =>{
        if(columnName=="Valor por Passageiro" || columnName=="Valor Total"){
            ws.cell(rowIndex,columnIndex++)
            .number(record [columnName])
            .style(style)
        }else if(acessar=='false'){
          ws.cell(rowIndex,columnIndex++)
              .string(record [columnName])
              .style({
                fill: {
                  type: 'pattern',
                  patternType: 'solid',
                  bgColor: cores[parseInt(record.Data.substring(0,2))],
                  fgColor: cores[parseInt(record.Data.substring(0,2))],
                },
              })
        }else if(acessar=='true'){
          ws.cell(rowIndex,columnIndex++)
              .string(record [columnName])
        }
      });
      rowIndex++;
  }); 
   
  wb.write('./relatorio/planilha.xlsx');

  await sleep(3000);

  return new Promise((resolve, reject) => {
    //outputStream.on('finish', () => {
      resolve();
    //});

    //outputStream.on('error', (error) => {
    //  reject(error);
    //});
  });

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}

export default relModec;