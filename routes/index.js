const express = require('express');
const router = express.Router();
const TaskSchema = require("../validador_Formulario/TaskSValidador");
const { enviar } = require('../public/javascripts/emailContato');

const { authMiddleware }= require('../controller/Controle_de_Acesso');
const { Login }= require('../controller/Controle_de_Acesso');
const { Sair }= require('../controller/Controle_de_Acesso');

const { RegistrarPonto }= require('../controller/CRUD_Pontos');
const { ExibirPontos }= require('../controller/CRUD_Pontos');
const { EditarPonto }= require('../controller/CRUD_Pontos');
const { ExcluirPontos }= require('../controller/CRUD_Pontos');
const { CargaPontos }= require('../controller/Carga');
const { ExibirPontoEditar }= require('../controller/CRUD_Pontos');


const { CadastrarUsuario }= require('../controller/CRUD_Usuarios');
const { EditarUsuario }= require('../controller/CRUD_Usuarios');
const { ExcluirUsuario }= require('../controller/CRUD_Usuarios');

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

router.get('/cadastro', function(req, res) {
  res.render('cadastro');
});

router.post('/descricao', (req, res) => {
  res.render('descricao');
});

router.post('/contato/enviar', enviar);


// Rota de login
router.post('/login',Login);
// Rota de saída
router.get('/sair',Sair);
// Rota de Cadastro de usuário
router.post('/cadastro',CadastrarUsuario);

// Rotas protegidas

//Rota para Editar usuarios
router.post('/perfil/editar', authMiddleware,EditarUsuario );
//Rota para Excluir usuarios
router.post('/perfil/excluir', authMiddleware,ExcluirUsuario);
//Rota para Registrar Pontos
router.post('/registro',authMiddleware,RegistrarPonto);
//Rota para Exibir Pontos
router.get('/home', authMiddleware, ExibirPontos);
//Rota para Excluir Pontos
router.get('/excluir/:id',authMiddleware,ExcluirPontos);
//Rota para Carregar 5 Pontos
router.post('/carga-registros',authMiddleware,CargaPontos);
//Rota para exibir a view de registrar Ponto
router.get('/registrar',authMiddleware, function(req, res) {
  res.render('registrar');
});

//Rota para exibir a view de Perfil
router.get('/perfil',authMiddleware, function(req, res) {
  res.render('perfil');
});
// Rota para atualizar o ponto editado
router.post('/editar/:id', authMiddleware, EditarPonto);

router.get('/editar/:id', authMiddleware, ExibirPontoEditar);

module.exports = router;