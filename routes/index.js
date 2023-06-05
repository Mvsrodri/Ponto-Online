var express = require('express');
var router = express.Router();

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

module.exports = router;
