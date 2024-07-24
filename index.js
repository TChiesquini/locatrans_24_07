import fetch from "node-fetch";
import { readFile } from 'fs/promises';
import express from "express";
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { ObjectId, ConnectionReadyEvent } from 'mongodb';
import multer from 'multer';
import path from 'path';
//import { glob } from 'glob';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import { google } from 'googleapis';
//import xl from 'excel4node';

import Message from './model/messaging.js';
import Cliente from './model/cliente.js';
import Configuracao from './model/configuracao.js';
import Motorista from './model/motorista.js';
import Veiculos from './model/veiculos.js';
import User from './model/user.js';
import UserCliente from "./model/userxcliente.js";
import Solicitacao from "./model/solicitacao.js";
import Passageiro from "./model/passageiro.js";
import Trajeto from "./model/trajeto.js";
import Contrato from "./model/contrato.js";
import Modec from "./model/solicitacaoMODEC.js";
import CCusto from "./model/centrocusto.js";
import Tabela from "./model/tabelaprecos.js";

import validaPassageiro from "./functions/validaPassageiro.js";
import salvarSolicitacao from "./functions/solicitPost.js";
import alterarSolicitacao from "./functions/solicitPut.js";

import relModec from "./functions/relModec.js";
import relSolicMotorista from "./functions/relSolicMotorista.js";

import Config from "./model/configuracao.js";
import SolicitHeader from "./model/solicitHeader.js";
import SolicitPassageiro from "./model/solicitPassageiro.js";
import SolicitMotorista from "./model/solicitMotorista.js";
import SolicitVeiculo from "./model/solicitVeiculo.js";
import SolicitTrajeto from "./model/solicitTrajeto.js";
import { constants } from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega o certificado e a key necessários para a configuração.
const options = {
  key: fs.readFileSync("//etc/letsencrypt/live/nova.monitor.eco.br/privkey.pem"),
  cert: fs.readFileSync("//etc/letsencrypt/live/nova.monitor.eco.br/fullchain.pem")
};

const app = express();
const serviceAccount = JSON.parse(
  await readFile(
    new URL('./chave.json', import.meta.url)
  )
);

global.__dir = __dirname;

app.use(express.static("src"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var httpsServer = https.createServer(options, app);

httpsServer.listen(3100,function(erro){
    if(erro){
        console.log("Ocorreu um erro!")
    }else{
        console.log("Servidor LocaTrans iniciado com sucesso!")
    }
})

/////////

app.use(compression());
app.use(cors());
app.use(express.static("src"));

app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

app.use(
helmet.contentSecurityPolicy({
    directives: {
    "script-src": ["'self'", "https://www.gstatic.com"],
    "style-src": null,
    },
})
);
////////

const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const SCOPES = [MESSAGING_SCOPE];

function getAccessToken() {
return new Promise(function(resolve, reject) {
    const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    SCOPES,
    null
    );
    jwtClient.authorize(function(err, tokens) {
    if (err) {
        reject(err);
        return;
    }
    resolve(tokens.access_token);
    });
});
}

const sendMessage = async (message) => {
    
    const accessToken = await getAccessToken();
    const response = await fetch('https://fcm.googleapis.com/v1/projects/locatrans-cf413/messages:send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const data = await response.json();
    return data;
  };

app.post('/sendmessage', async function(req,res,next){

  var formatter = new Intl.DateTimeFormat('pt-BR');
  var date = new Date();
  var title = '';
  const nomeCliente = await Cliente.findOne({'_id': req.body.title});
  if(!nomeCliente){
    title = req.body.title
  }else{
    title = nomeCliente.razao
  }

  const resposta1 = await sendMessage(
    {
        "message": {
          "topic": req.body.topic,
          "notification": {
            "title": title,
            "body": req.body.corpo
          },
          "android": {
            "notification": {       
              "default_sound": true,
              "default_vibrate_timings": true,
              "default_light_settings": true
            },
            "priority": "high"
          },
          "apns": {
            "payload": {
              "aps": {
                "category": "NEW_MESSAGE_CATEGORY"
              }
            }
          }
        }
    }
);

  const message = await Message.create({
    datain: formatter.format(date),
    horain: new Date().toLocaleTimeString(),
    titulo: req.body.title,
    corpo: req.body.corpo,
    descricao: req.body.descricao
  });

  console.log(message);

  if(resposta1.name){
    res.status(200).send(`Mensagem enviada com sucesso!! ${resposta1.name}`)
  }else{
    res.status(400).send(resposta1)
  }

});

app.put('message/:id', async function(req,res){

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;
    res.status(200).json(await Message.updateOne({ "_id" : id },{$set: dados}));
  }catch{
    res.status(400).json({erro:`${ex}`});
  }

})

app.get('/message', async function(req,res,next){

  try{
      res.status(200).json(await Message.find());
  }
  catch(ex){
      res.status(400).json({erro:`${ex}`});
  }
  
});

// Tratamento imagem

app.use(express.static('/home/tony/locatrans/locaimagen/'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, '/home/tony/locatrans/locaimagen')
  },
  filename: function (req, file, cb) {
      // Extração da extensão do arquivo original:
      var extensaoArquivo = path.extname(file.originalname)

      const novoNomeArquivo = req.params.idMembro

      // Indica o novo nome do arquivo:
      cb(null, `${novoNomeArquivo}.png`)

  }
});

const upload = multer({ storage });

app.post('/uploads/:idCliente', upload.single('file'), async (req, res) => {

  try{
      return res.json(req.file.filename);
  }
  catch (err){
      return res.status(400).send({error: err})
  }
});

app.get('/imagens/:nomeArquivo', (req, res) => {
  const nomeArquivo = req.params.nomeArquivo;
  const caminhoArquivo = `/home/tony/locatrans/locaimgen/${nomeArquivo}`;

  fs.access(caminhoArquivo, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send('Imagem não encontrada');
    } else {
      res.sendFile(caminhoArquivo);
    }
  });
});

// Authenticação

app.post('/vinculo', async (req, res) => {
  const { email, cnpj } = req.body;
  try {
      const id_user    = ObjectId(await User.findOne({ email: email },'_id')).valueOf()

      const id_cliente = ObjectId(await Cliente.findOne({ cnpj: cnpj },'_id')).valueOf()

      const usercliente = await UserCliente.create({cliente: id_cliente,user: id_usuario});

      return res.send({ 
          usercliente
       });
  } catch (err) {
      return res.status(400).send({ error: 'Falha no registro!!!'})
  }
});

app.get('/vinculo/:email', async function(req,res,next){
  id_usuario = ObjectId(await User.findOne({ email: req.params.email },'_id')).valueOf()
  try{
      res.json(await vinc.find({id_usuario: id_usuario}));
  }
  catch(ex){
      res.status(400).json({erro:`${ex}`});
  }
});

app.post('/authenticate', async (req, res) => {

  try{
      // RECUPERA OS DADOS DO REQUEST
      let email = req.body.usuario;
      let password = req.body.password;

      // PRE-VALIDAÇÃO DO USUÁRIO E SENHA
      if (!email || !password) { 
          res.status(400).send({ error: 'Usuário/Senha não informado(s).' }); 
          return
      } else {
          email = email.toLowerCase();
      }

      const user = await User.findOne({ email: email }).select('+password');

      if (!user){
          res.status(400).send({ error: 'Usuário não encontrado!'});
          return
      }

      const cryptPwd = bcrypt.hashSync(password, 10);

      if (!bcrypt.compareSync(password, user.password)){
          res.status(400).send({ error: 'Senha não confere!'});
          return
      }

      user.password = undefined;

      if(user.nivel=='C'){

        const userCliente = await UserCliente.findOne({ user: user._id });
        const cliente = await Cliente.findOne({id: userCliente.cliente});

        res.status(200).send({ 
          user,
          cliente
        });
      }else{
        res.status(200).send({ 
          user
        });
      }
  } catch (err) {
      res.status(500).json([{ Resposta: err.message }]);
      //next(err);
  }

});

// Configurações
app.post('/configuracao', async (req, res) => {

  try{
      const configuracao = await Configuracao.create(req.body);

      return res.status(200).send({ configuracao });      
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/configuracao', async (req, res) => {


  try{
      res.status(200).json(await Configuracao.find());
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.put('/configuracao/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    const dados = req.body;
    
    res.status(200).json(await Configuracao.updateOne({ "_id" : id },{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});

app.delete('/configuracao/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await Configuracao.deleteOne({'_id': id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

// Espaço para novos cruds //

// Cliente
app.post('/cliente', async (req, res) => {

  try{
      const cliente = await Cliente.create(req.body);

      return res.status(200).send({ cliente });      
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/cliente', async (req, res) => {

  //let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    res.status(200).json(await Cliente.find());
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/clienteID/:id', async (req, res) => {

  try{
    res.status(200).json(await Cliente.findOne({'_id': req.params.id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/clienteFilter/:texto', async (req, res) => {

  let texto = req.params.texto;

  try{
    res.status(200).json(await Cliente.find({razao: { $regex: texto } }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.delete('/cliente/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await Cliente.deleteOne({'_id': id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.put('/cliente/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    const dados = req.body;
    
    res.status(200).json(await Cliente.updateOne({ "_id" : id },{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});

// Motorista

app.post('/motorista', async (req, res) => {

  try{
    const motorista = await Motorista.create(req.body);

    return res.status(200).send({ motorista });
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/motorista/:id?', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await Motorista.findOne({'_id': id}));
    }else{
      res.status(200).json(await Motorista.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.delete('/motorista/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    res.status(200).json(await Motorista.deleteOne({'_id': id}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.put('/motorista/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;

    res.status(200).json(await Motorista.updateOne({'_id': id},{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

// Veiculos

app.post('/veiculos', async (req, res) => {

  try{
    const veiculos = await Veiculos.create(req.body);

    return res.status(200).send({ veiculos });
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/veiculos/:id?', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};
  let i = 0;

  try{
    if(req.params.id){
      res.status(200).json(await Veiculos.findOne({'_id': id}));
    }else{
      let dados = await Veiculos.find();

      for(i = 0; i < dados.length; i++) {
        //let exibicao = dados[i].tipo+' - '+dados[i].placa+' - '+dados[i].modelo;
        dados[i].exibicao = dados[i].tipo+' - '+dados[i].placa+' - '+dados[i].modelo;

      }

      res.status(200).json(dados);
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.delete('/veiculos/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    res.status(200).json(await Veiculos.deleteOne({'_id': id}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.put('/veiculos/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;

    res.status(200).json(await Veiculos.updateOne({'_id': id},{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

// user

app.post('/user', async (req, res) => {

  const { email } = req.body;
  try {

      if ( await User.findOne({ email }))
          return res.status(400).send({ error: 'E-mail já cadastrado!'});

      const user = await User.create(req.body);

      user.password = undefined;

      return res.send({ 
          user
       });
  } catch (err) {
      return res.status(400).send({ error: 'Falha no registro!!!'})
  }

});

app.get('/user/:id?', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await User.findOne({'_id': id}));
    }else{
      res.status(200).json(await User.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/userEmail/:email', async (req, res) => {

  try{
    const user = await User.findOne({'email': req.params.email});
    if(!user){
      res.status(400).json({ resposta: 'Usuário não encontrado' });
    }else{
      res.status(200).json(user);
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.delete('/user/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    res.status(200).json(await User.deleteOne({'_id': id}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.put('/user/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;

    res.status(200).json(await User.updateOne({'_id': id},{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.put('/userpass/:id', async ( req, res) => {
  
  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try {
    
    const password = req.body.password;
    const cryptPwd = bcrypt.hashSync(password, 10);

    res.status(200).json(await User.updateOne({'_id': id},{$set: {password: cryptPwd}}));

  } catch (ex) {
    res.status(400).json({ erro: `${ex}` });
  }

})

// user x cliente

app.post('/usercliente', async (req, res) => {

  try{
    const usercliente = await UserCliente.create(req.body);

    return res.status(200).send({ usercliente });
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/usercliente/:id?', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await UserCliente.findOne({'_id': id}));
    }else{
      res.status(200).json(await UserCliente.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/userclienteuser/:user', async (req, res) => {

  let user = {_id:new mongoose.Types.ObjectId(req.params.user)};

  try{
    const cliente = await UserCliente.findOne({'user': req.params.user});
    res.status(200).json(await Cliente.findOne({'_id': cliente.cliente}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.delete('/usercliente/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    res.status(200).json(await UserCliente.deleteOne({'_id': id}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.put('/usercliente/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;

    res.status(200).json(await UserCliente.updateOne({'_id': id},{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

// Solicitação

app.post('/solicitacao', async (req, res) => {
//2024-01-22T19:23:00Z - banco
//2024-01-22 16:23:00.000 dart
  try{
    // existe uma diferença de 3h na hora de salvar, a linha abaixo ajusta a diferença
    let newData = new Date(new Date(req.body.data).getTime() - (180 * 60 * 1000 ));
    req.body.data = newData;

    const configs = await Config.find();
    if(configs[0].numOrdemServicoAno!=new Date().getUTCFullYear().toString()){
      // altero o ano da ordem de servico e reinicia a numeraçao
      await Config.updateMany({$set: {numOrdemServico: "000000",numOrdemServicoAno: new Date().getUTCFullYear().toString()}});
    }
    const numOrdemServico = ("000000" + (parseInt(configs[0].numOrdemServico)+1)).slice(-6);
    req.body.numOrdemServico = numOrdemServico+'/'+configs[0].numOrdemServicoAno;

    const solicitacao = await Solicitacao.create(req.body);

    // altero o numero do orçamento para um a mais
    await Config.updateMany({$set: {numOrdemServico: numOrdemServico}});

    return res.status(200).send({ solicitacao });
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/solicitacao/:id?', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await Solicitacao.findOne({'_id': id}));
    }else{
      res.status(200).json(await Solicitacao.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/solicitacaohoje', async (req, res) => {

  const dataIni = new Date(new Date().toDateString());
  const dataFim = new Date(new Date(new Date().toDateString()).getTime() + (1439 * 60 * 1000));

  try{
    res.status(200).json(await Solicitacao.find({
      $expr: {
        $and: [
          { $gte: ['$data',  dataIni ]},
          { $lte: ['$data',  dataFim ] },
        ]
      },
    }))
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/solicitacaoamanha', async (req, res) => {

  const dataIni = new Date(new Date(new Date().toDateString()).getTime() + (1440 * 60 * 1000));
  const dataFim = new Date(new Date(dataIni).getTime() + (1439 * 60 * 1000));

  try{
    res.status(200).json(await Solicitacao.find({
      $expr: {
        $and: [
          { $gte: ['$data',  dataIni ]},
          { $lte: ['$data',  dataFim ] },
        ]
      },
    }))
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.delete('/solicitacao/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    res.status(200).json(await Solicitacao.deleteOne({'_id': id}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.put('/solicitacao/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};
  
  // existe uma diferença de 3h na hora de salvar, a linha abaixo ajusta a diferença
  let newData = new Date(new Date(req.body.data).getTime() - (180 * 60 * 1000 ));
  req.body.data = newData;

  try{
    const dados = req.body;

    res.status(200).json(await Solicitacao.updateOne({'_id': id},{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.post('/solicitacaonew', async (req, res) => {

    try{

      const solicitacaoHeader = salvarSolicitacao(req.body);

      return res.status(200).send({ solicitacaoHeader });
    }
    catch(ex){
      res.status(400).json({ erro: `${ex}` });
    }
});

app.put('/solicitacaonew', async (req, res) => {
  
  // existe uma diferença de 3h na hora de salvar, a linha abaixo ajusta a diferença
  //let newData = new Date(new Date(req.body.data).getTime() - (180 * 60 * 1000 ));
  //req.body.data = newData;

  try{
    const dados = req.body;

    const solicitacaoHeader = alterarSolicitacao(dados);

    return res.status(200).send({ solicitacaoHeader });
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/solicitacaoBrowse/:hoje', async (req, res) => {

  let dadosRet = [];
  let dataIni;
  let dataFim;
  // filtro de data enviado
  if(req.params.hoje==0){
    // filtro para data de hoje
    dataIni = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()+1, 0, 0, 0, 0);
    dataFim = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()+1, 23, 59, 59, 0);
  // filtro para geral
  }else if(req.params.hoje==2){
    dataIni = new Date(new Date().getUTCFullYear() - 30, 12, 31, 0, 0, 0, 0); //hoje - 30 anos
    dataFim = new Date(new Date().getUTCFullYear() + 2, 12, 31, 23, 59, 59, 0); // hoje + 2 anos
  }else if(req.params.hoje==1){
    dataIni = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), 0, 0, 0, 0); //hoje
    dataFim = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()+90, 23, 59, 59, 0);
  }else{
    dataIni = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), 0, 0, 0, 0);
    dataFim = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), 23, 59, 59, 0);
  }

  try{

    const header = await SolicitHeader.find({
      $expr: {
        $and: [
          { $gte: ['$dataViagem',  dataIni ]},
          { $lte: ['$dataViagem',  dataFim ] },
        ]
      },
    }).sort({dataViagem:1}); 

    for (let index = 0; index < header.length; index++) {
 
      let dadosPassageiro = await SolicitPassageiro.find({"numOrdemServico": header[index].numOrdemServico});
      let dadosVeiculo = await SolicitVeiculo.find({"numOrdemServico": header[index].numOrdemServico});
      let dadosMotorista = await SolicitMotorista.find({"numOrdemServico": header[index].numOrdemServico});
      let dadosTrajeto = await SolicitTrajeto.find({"numOrdemServico": header[index].numOrdemServico});
      let dadosCliente = await Cliente.find({"_id": header[index].clienteId});

      let returnPassageiro = [];
      let returnVeiculo = [];
      let returnMotorista = [];
      let returnTrajeto = [];

      let passageiros = "";
      let veiculos = "";
      let motoristas = "";
      let origens = "";
      let destinos = "";

      for (let index1 = 0; index1 < dadosPassageiro.length; index1++) {
        passageiros = passageiros + dadosPassageiro[index1].passageiro_nome + "\n"
        // adicionar ao json a tag trajeto com o index do trajeto do passageiro dentro da lista json dos trajetos selecionados
        //dadosPassageiro[index1].trajeto = dadosTrajeto.findIndex((tr) => {return tr._id == dadosPassageiro[index1].trajetoId});

        returnPassageiro.push({
          "_id": dadosPassageiro[index1]._id,
          "passageiro_id": dadosPassageiro[index1].passageiro_id,
          "nome": dadosPassageiro[index1].passageiro_nome,
          "celular": dadosPassageiro[index1].passageiro_celular,
          "trajetoId": dadosPassageiro[index1].trajetoId,
          "origem": dadosPassageiro[index1].origem,
          "destino": dadosPassageiro[index1].destino,
          "trajeto": dadosTrajeto.findIndex((tr) => {return tr._id == dadosPassageiro[index1].trajetoId})<0 ?
          dadosTrajeto.findIndex((tr) => {return tr.trajeto_id == dadosPassageiro[index1].trajetoId}) :
          dadosTrajeto.findIndex((tr) => {return tr._id == dadosPassageiro[index1].trajetoId})          
        })
        //dadosNPassageiro.push(
        //  Object.assign(dadosPassageiro[index1], {trajeto: dadosTrajeto.findIndex((tr) => {return tr._id == dadosPassageiro[index1].trajetoId})})
        //) 
      }
      for (let index2 = 0; index2 < dadosVeiculo.length; index2++) {
        veiculos = veiculos + dadosVeiculo[index2].veiculo_tipo + " - Placa: " + dadosVeiculo[index2].veiculo_placa + "\n"

        returnVeiculo.push({
          "_id": dadosVeiculo[index2]._id,
          "veiculo_id": dadosVeiculo[index2].veiculo_id,
          "modelo": dadosVeiculo[index2].veiculo_modelo,
          "tipo": dadosVeiculo[index2].veiculo_tipo,
          "placa": dadosVeiculo[index2].veiculo_placa
        })
      }
      for (let index3 = 0; index3 < dadosMotorista.length; index3++) {
        motoristas = motoristas + dadosMotorista[index3].motorista_nome + "\n"

        returnMotorista.push({
          "_id": dadosMotorista[index3]._id,
          "motorista_id": dadosMotorista[index3].motorista_id,
          "nome": dadosMotorista[index3].motorista_nome
        })
      }
      for (let index4 = 0; index4 < dadosTrajeto.length; index4++) {
        origens = origens + dadosTrajeto[index4].trajeto_origem + "\n"
        destinos = destinos + dadosTrajeto[index4].trajeto_destino + "\n"
        
        returnTrajeto.push({
          "_id": dadosTrajeto[index4]._id,
          "trajeto_id": dadosTrajeto[index4].trajeto_id,
          "descricao": dadosTrajeto[index4].trajeto_descricao,
          "origem": dadosTrajeto[index4].trajeto_origem,
          "destino": dadosTrajeto[index4].trajeto_destino
        })
      }

    dadosRet.push({
        "_id": header[index]._id,
        "passageiros": passageiros,
        "numOrdemServico": header[index].numOrdemServico,
        "idDrake": header[index].idDrake,
        "contrato": header[index].contrato,
        "cliente": header[index].clienteId,
        "clienteId": header[index].clienteId,
        "razaoSocial": dadosCliente[0].razao,
        "nomeFantasia": dadosCliente[0].fantasia,
        "cnpj": dadosCliente[0].cnpj,
        "clienteNome": header[index].clienteNome,
        "centrocustoid": header[index].centrocustoid,
        "unidade": header[index].unidade,
        "solicitante": header[index].solicitante,
        "motivoSolicit": header[index].motivoSolicit,
        "dataViagem": header[index].dataViagem,
        "origem": origens,
        "destino": destinos,
        "motoristas": motoristas,
        "placas": veiculos,
        "observacao": header[index].observacao,

        "qtdePassageiro": header[index].qtdePassageiro,
        "qtdeVeiculo": header[index].qtdeVeiculo,
        "qtdeMotorista": header[index].qtdeMotorista,

        "kmPercorrido": header[index].kmPercorrido,
        "qtdePedagio": header[index].qtdePedagio,
        "vlrTotalPedagio": header[index].vlrTotalPedagio,
        "qtdeEstacionamento": header[index].qtdeEstacionamento,
        "vlrTotalEstacionamento": header[index].vlrTotalEstacionamento,
        "qtdeDiaria": header[index].qtdeDiaria,
        "vlrTotalDiaria": header[index].vlrTotalDiaria,
        "valorTotal": header[index].valorTotal,
        "status": header[index].status,

        "dadosPassageiro": returnPassageiro,
        "dadosVeiculo": returnVeiculo,
        "dadosMotorista": returnMotorista,
        "dadosTrajeto": returnTrajeto
      })
      
    }

    res.status(200).send({ 
      dadosRet
    });
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

})

app.get('/solicitacaonew/:id?', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await SolicitHeader.findOne({'_id': id}));
    }else{
      res.status(200).json(await SolicitHeader.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

})
  
app.get('/solicitPassageiro/:numOrdemServico', async (req, res) => {

  try{
    res.status(200).json(await SolicitPassageiro.find({'numOrdemServico': req.params.numOrdemServico}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

})

app.get('/solicitMotorista/:numOrdemServico', async (req, res) => {

  try{
    res.status(200).json(await SolicitMotorista.find({'numOrdemServico': req.params.numOrdemServico}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

})

app.get('/solicitVeiculo/:numOrdemServico', async (req, res) => {

  try{
    res.status(200).json(await SolicitVeiculo.find({'numOrdemServico': req.params.numOrdemServico}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

})

app.get('/solicitTrajeto/:numOrdemServico', async (req, res) => {

  try{
    res.status(200).json(await SolicitTrajeto.find({'numOrdemServico': req.params.numOrdemServico}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

})

app.put('/solicitNew/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;

    res.status(200).json(await SolicitHeader.updateOne({'_id': id},{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

})

// Passageiro

app.post('/passageiro', async (req, res) => {

  try{
    const passageiro = await Passageiro.create(req.body);

    return res.status(200).send({ passageiro });
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/passageiro/:id?', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await Passageiro.findOne({'_id': id}));
    }else{
      res.status(200).json(await Passageiro.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.delete('/passageiro/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    res.status(200).json(await Passageiro.deleteOne({'_id': id}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.put('/passageiro/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;

    res.status(200).json(await Passageiro.updateOne({'_id': id},{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

// Trajeto

app.post('/trajeto', async (req, res) => {

  try{
    const trajeto = await Trajeto.create(req.body);

    return res.status(200).send({ trajeto });
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/trajeto/:id?', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await Trajeto.findOne({'_id': id}));
    }else{
      res.status(200).json(await Trajeto.find().sort({origem:1}));
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.delete('/trajeto/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    res.status(200).json(await Trajeto.deleteOne({'_id': id}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.put('/trajeto/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;

    res.status(200).json(await Trajeto.updateOne({'_id': id},{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

// Contrato

app.post('/contrato', async (req, res) => {

  try{
    const contrato = await Contrato.create(req.body);

    return res.status(200).send({ contrato });
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/contrato/:id?', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await Contrato.findOne({'_id': id}));
    }else{
      res.status(200).json(await Contrato.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/contratoCliente/:cliente', async (req, res) => {

  try{
    res.status(200).json(await Contrato.find({'cliente': req.params.cliente}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.delete('/contrato/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    res.status(200).json(await Contrato.deleteOne({'_id': id}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.put('/contrato/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;

    res.status(200).json(await Contrato.updateOne({'_id': id},{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

// Centro de Custo

app.post('/ccusto', async (req, res) => {

  try{
    const ccusto = await CCusto.create(req.body);

    return res.status(200).send({ ccusto });
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/ccusto/:id?', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await CCusto.findOne({'_id': id}));
    }else{
      res.status(200).json(await CCusto.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/ccustoRef/:referencia', async (req, res) => {

  try{
    res.status(200).json(await CCusto.find({'referencia': req.params.referencia}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.delete('/ccusto/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    res.status(200).json(await CCusto.deleteOne({'_id': id}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.put('/ccusto/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;

    res.status(200).json(await CCusto.updateOne({'_id': id},{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

// Tabela de Preços

app.post('/tabela', async (req, res) => {

  try{
    const tabela = await Tabela.create(req.body);

    return res.status(200).send({ tabela });
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.get('/tabela/:id?', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await Tabela.findOne({'_id': id}));
    }else{
      res.status(200).json(await Tabela.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.delete('/tabela/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    res.status(200).json(await Tabela.deleteOne({'_id': id}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.put('/tabela/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;

    res.status(200).json(await Tabela.updateOne({'_id': id},{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

// Solicitação MODEC

app.post('/modec', async (req, res) => {

  const recipientId = serviceAccount.modec_homolog_codigo_fornece;
  const lerMessage = serviceAccount.modec_type_ler_message;
  const aceiteMessage = serviceAccount.modec_type_confirmar_message;
  let idMessage = 0;
  const modecToken = (serviceAccount.modec_ambiente_producao==true)? serviceAccount.modec_producao_token : serviceAccount.modec_homolog_token;
  const conteudo = [{"RecipientId":recipientId,"type":lerMessage}];
  let conteudoControl = [{"SenderId":recipientId,"type":aceiteMessage,"Id":idMessage}];
  //let centrodeCusto;
  let passageiro;
  //let trajeto;
  let resultado = 0;
  let i = 0;
  let x = 0;
  let dadosPainel = [];
  let participant = [];
  let mensagemReturn = 'Sucesso';

  // busco todas as solicitações lançadas e não enviado o ACEITE
  const response = await fetch('https://logistic-integrator-tst.drake.bz/MessageService/Receive', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${modecToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(conteudo),
  });
  const data = await response.json();

  for(i = 0; i < data.length; i++) {
    try{

      let incluido = await Modec.find({'idSolicitacao': data[i].Id});

      if (incluido.length==0){

        idMessage = data[i].Id;
        
        // é realizada o ACEITE DE VISTA DA SOLICITAÇÃO
        let resposta = await fetch('https://logistic-integrator-tst.drake.bz/MessageService/Control', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${modecToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(conteudoControl),
        });
         
        if(data[i].LogisticNeed.Participant==null){
  
          data[i].LogisticNeed.Associated.forEach( function (element) {
            participant.push(element);
            dadosPainel.push(
              `Nome: `+element.Participant.Name+`
  Origem: `+element.Origin.Name+`
  Destino: `+element.Destination.Name
            ) 
          });
  
        }else{
          participant.push(data[i].LogisticNeed);
          dadosPainel.push(
            `Nome: `+data[i].LogisticNeed.Participant.Name+`
  Origem: `+data[i].LogisticNeed.Origin.Name+`
  Destino: `+data[i].LogisticNeed.Destination.Name
            ) 
        };
  
        passageiro = await validaPassageiro(participant);
  
        if(passageiro.todosValores==true){
          const modec = await Modec.create({
            idSolicitacao: data[i].Id,
            solicitante: data[i].SenderUserName,           
            data: data[i].Sent,
            dataViagem: data[i].LogisticNeed.Start,
            descricao: data[i].LogisticNeed.Comments,
            qtdePassageiro: participant.length,
            passageiro: passageiro.dados,
            painel: dadosPainel,
            status: 'R',
            valor: passageiro.dados[0].total
          });
          }else{
            mensagemReturn = 'Existem Trajetos sem valor, ocasionando não importação de solicitações !'
          }
 
        dadosPainel = [];
        participant = [];
        

      }


    }
    catch(ex){
      resultado = 1;
      //res.status(400).json({ erro: `${ex}` });
    }   
  };

  //if(resultado==0){
    return res.status(200).send(mensagemReturn);
  //}else{
  //  return res.status(400).send("Falha");
  //}


});

app.get('/modec/:id?', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await Modec.findOne({'_id': id}));
    }else{
      res.status(200).json(await Modec.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.put('/modec/:id', async (req, res) => {

  let id = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;
    if(dados.cliente=='Null' || dados.cliente=='null'){
      dados.cliente=null
    };
    if(dados.motorista=='Null' || dados.motorista=='null'){
      dados.motorista=null
    };
    if(dados.veiculo=='Null' || dados.veiculo=='null'){
      dados.veiculo=null
    };
    

    res.status(200).json(await Modec.updateOne({'_id': id},{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }
});

app.post('/modeclocatrans', async (req,res) => {

  const dados = await Modec.findOne({'_id': req.body.id});
  const cliente = await Cliente.findOne({'_id': dados.cliente})
  const configs = await Config.find();

  if(configs[0].numOrdemServicoAno!=new Date().getUTCFullYear().toString()){
    // altero o ano da ordem de servico e reinicia a numeraçao
    await Config.updateMany({$set: {numOrdemServico: "000000",numOrdemServicoAno: new Date().getUTCFullYear().toString()}});
  }
  const numOrdemServico = ("000000" + (parseInt(configs[0].numOrdemServico)+1)).slice(-6);

  const passageiro = dados.passageiro;
  let y = 0;
  let solicitacao;
  let passageiros = [];
  let trajetos = [];
  let trajetoOld;
  let trajetoSolic;

  solicitacao = await SolicitHeader.create({
    numOrdemServico: numOrdemServico+"/"+configs[0].numOrdemServicoAno,
    clienteId: cliente._id,
    clienteNome: cliente.razao,
    idDrake: dados.idSolicitacao,
    solicitante: dados.solicitante,
    contrato: null,
    dataViagem: dados.dataViagem,
    observacao: dados.descricao,
    centrocustoid: passageiro[0].centrodeCusto._id,
    qtdePassageiro: dados.qtdePassageiro,
    // D = À definir, A = Agendado, C = Cancelado, N = No Show, P = Programado, R = Realizado
    status: "D"
  });

  for(y = 0; y < passageiro.length; y++){
    try{

      trajetos = []
      if(trajetoOld != passageiro[y].trajeto._id.toString()){
          trajetos.push({
            "numOrdemServico": numOrdemServico+'/'+configs[0].numOrdemServicoAno,
            "trajeto_id": passageiro[y].trajeto._id,
            "trajeto_descricao": passageiro[y].trajeto.descricao,
            "trajeto_origem": passageiro[y].trajeto.origem,
            "trajeto_destino": passageiro[y].trajeto.destino
          })
    
        trajetoSolic = await SolicitTrajeto.create(trajetos[0]);
      }
      
      trajetoOld = passageiro[y].trajeto._id.toString();

      passageiros = []
      
      passageiros.push({
        "numOrdemServico": numOrdemServico+'/'+configs[0].numOrdemServicoAno,
        "dataViagem": dados.dataViagem,
        "passageiro_id": passageiro[y].passageiro._id,
        "passageiro_nome": passageiro[y].passageiro.nome,
        "trajetoId": trajetoSolic._id,
        "origem": trajetoSolic.trajeto_origem,
        "destino": trajetoSolic.trajeto_destino
      })

      const passSolic = await SolicitPassageiro.create(passageiros[0]);
      
    }catch{
        return res.status(400).json({ resposta: `Erro: ${ex}` });
    }
  }

  // altero o status da solicitação Modec para Aprovado, para filtrar no listview
  const statusModec = {'status': 'A'};
  await Modec.updateOne({'_id': req.body.id},{$set: statusModec});
  // altero o numero do orçamento para um a mais
  await Config.updateMany({$set: {numOrdemServico: numOrdemServico}});
  //

  return res.status(200).send({ resposta: 'Sucesso' });

});

app.get('/relmodec1/:acesso/:dataini/:datafim/:cliente/:nome', async (req, res) => {

  if(fs.existsSync('./relatorio/planilha.xlsx')){
    fs.unlinkSync('./relatorio/planilha.xlsx');
  }

  const acesso = req.params.acesso;
  const dataini = (req.params.dataini).substring(0,10)+' 00:00:00.000';
  const datafim = (req.params.datafim).substring(0,10)+' 00:00:00.000';
  const cliente = req.params.cliente == 'null' ? null : req.params.cliente;
  let caminhoArquivo = '/home/tony/locatrans/relatorio/planilha.xlsx'

  try {
    await relModec(acesso,dataini,datafim,cliente);
    res.status(200).sendFile(caminhoArquivo);
  } catch (error) {
    res.status(500).send('Erro ao gerar Relatório');
  }
});

app.get('/relSolicMot/:dataini/:datafim/:motorista/:nome', async (req, res) => {

  if(fs.existsSync(`./relatorio/${req.params.nome}.pdf`)){
    fs.unlinkSync(`./relatorio/${req.params.nome}.pdf`);
  }

  const dataini = (req.params.dataini).substring(0,10)+' 00:00:00.000';
  const datafim = (req.params.datafim).substring(0,10)+' 00:00:00.000';
  const motorista = req.params.motorista == 'null' ? null : req.params.motorista;
  let caminhoArquivo = `/home/tony/locatrans/relatorio/${req.params.nome}.pdf`;

  try {
    await relSolicMotorista(dataini,datafim,motorista,req.params.nome);
    res.status(200).sendFile(caminhoArquivo);
  } catch (error) {
    res.status(500).send('Erro ao gerar Relatório');
  }
});

// TESTE KAPAZI

app.post('/kapazi', async (req, res) => {

  try{

    fs.unlinkSync("/home/tony/locatrans/kapazi/hash.txt");

    const code = req.body.code;
    const dados = code

    fs.writeFile("/home/tony/locatrans/kapazi/hash.txt", dados, function(erro) {

      if(erro) {
          throw erro;
      }
  
      console.log("Arquivo salvo");
    });

    res.status(200).json({return: 'ok'});
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});

app.get('/kapazi', async (req,res) => {

  try {
    let dados = fs.readFileSync("/home/tony/locatrans/kapazi/hash.txt", 'utf8', function (err, data) {
      // Display the file content
      console.log(data);
    });
  res.status(200).json({return: dados});

  } catch (ex) {
    res.status(400).json({ erro: `${ex}` });
  }
})