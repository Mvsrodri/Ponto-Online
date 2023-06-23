var express = require('express');
var router = express.Router();
var TaskSchema = require("../validador_Formulario/TaskSValidador");
const { enviar } = require('../public/javascripts/emailContato');

const Ponto = require("../Model/Ponto");


router.get('/', function(req, res) {
  res.render('index');
});

router.get('/descricao', function(req, res) {
  res.render('descricao');
});

router.get('/tecnologias-e-ferramentas', function(req, res) {
  res.render('tecnologias');
});

router.get('/desenvolvedores', function(req, res) {
  res.render('desenvolvedores');
});

router.get('/contato', function(req, res) {
  res.render('contato');
});


//Validação do Formulario atraves do metodo post verificando a rota
router.post('/descricao', (req, res) => {
  const { error, value } = TaskSchema.validate(req.body);
  //condicional para verificação de erros de logica
  if (error) {
    //mensagem de erro de logica
    res.send("Erro de validação"+error);

  } else {

    const email = value.email;
    const senha = value.senha;

    //condicional para verificar se o email e senha são validos e em caso positivo retornar a pagina descrição.
    if (email === "teste@teste.com" && senha === "123") {
      res.render('descricao');
    } else {
      res.send("Informações de acesso incorretas");
    }
  }
});
router.post('/contato/enviar', enviar);

router.post('/registro', (req, res) => {
  const entrada1 = req.body.entrada1;
  const saida1 = req.body.saida1;
  const entrada2 = req.body.entrada2;
  const saida2 = req.body.saida2;

  // Validar horários
  if (saida1 < entrada1 || entrada2 < saida1 || saida2 < entrada1 || saida2 < saida1) {
    console.error('Horários inválidos');
    return res.sendStatus(400);
  }
  
  const novaData = new Date();
  
  Ponto.findOne({ data: { $gte: novaData.setHours(0, 0, 0, 0), $lte: novaData.setHours(23, 59, 59, 999) } })
    .then((pontoExistente) => {
      if (pontoExistente) {
        console.error('Já existe um ponto registrado para esta data');
        return res.sendStatus(409); // Conflito - Data já registrada
      }
      
      const ponto = new Ponto({
        data: novaData,
        entrada1: req.body.entrada1,
        saida1: req.body.saida1,
        entrada2: req.body.entrada2,
        saida2: req.body.saida2
      });

      ponto.save()
        .then(() => {    
          res.redirect('/home');
        })
        .catch((err) => {
          console.error('Erro ao registrar ponto:', err);
          res.sendStatus(500);
        });
    })
    .catch((err) => {
      console.error('Erro ao buscar ponto existente:', err);
      res.sendStatus(500);
    });
});

router.get('/home', (req, res) => {
  Ponto.find()
    .then((pontos) => {
      pontos.forEach((ponto) => {
        ponto.dataFormatada = ponto.data.toLocaleDateString('pt-BR');
      });
      res.render('home', { pontos });
      console.log(pontos);
    })
    .catch((err) => {
      console.error('Erro ao buscar os pontos:', err);
      res.sendStatus(500);
    });
});
router.post('/carga-registros', async (req, res) => {
  const pontos = [];

  const dataAtual = new Date();
  const decrementoDias = 1;
  const maxTentativas = 10;
  let tentativas = 0;

  for (let i = 0; i < 5; i++) {
    let novaData;
    let pontoExistente;

    do {
      novaData = new Date(dataAtual.getTime() - i * decrementoDias * 24 * 60 * 60 * 1000);
      novaData.setHours(0, 0, 0, 0); // Definir horários para 00:00:00
      pontoExistente = await Ponto.findOne({ data: novaData });
      tentativas++;
    } while (pontoExistente && tentativas < maxTentativas);

    if (tentativas >= maxTentativas) {
      console.error('Não foi possível encontrar uma nova data disponível para registro');
      return res.sendStatus(500);
    }

    const pontosExistenteMesmaData = await Ponto.find({ data: { $eq: novaData } });

    if (pontosExistenteMesmaData.length > 0) {
      console.error('Ponto já registrado com a mesma data');
      return res.sendStatus(400);
    }

    const ponto = new Ponto({
      data: novaData,
      entrada1: '09:00',
      saida1: '12:00',
      entrada2: '13:00',
      saida2: '18:00'
    });

    pontos.push(ponto);
  }

  Ponto.insertMany(pontos)
    .then(() => {
      res.redirect('/home');
    })
    .catch((err) => {
      console.error('Erro ao carregar registros:', err);
      res.sendStatus(500);
    });
});
router.get('/excluir/:id', (req, res) => {
  const pontoId = req.params.id;

  Ponto.findByIdAndRemove(pontoId)
    .then(() => {
      res.redirect('/home');
    })
    .catch((err) => {
      console.error('Erro ao excluir o registro de ponto:', err);
      res.sendStatus(500);
    });
});


module.exports = router;
