var express = require('express');
var router = express.Router();
var TaskSchema = require("../validador_Formulario/TaskSValidador");
const { enviar } = require('../public/javascripts/emailContato');


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



module.exports = router;
