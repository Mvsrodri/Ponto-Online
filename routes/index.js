const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const TaskSchema = require("../validador_Formulario/TaskSValidador");
const { enviar } = require('../public/javascripts/emailContato');

const Ponto = require("../Model/Ponto");
const Usuario = require('../Model/Usuario');
const secretKey = process.env.SECRET_KEY;

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

const authMiddleware = (req, res, next) => {
  // Verifique se o token JWT está presente no header da requisição ou nos cookies
  const token = req.headers.authorization || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido' });
  }

  // Verifique e decodifique o token JWT
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token de autenticação inválido' });
    }

    // O token é válido, adicione as informações do usuário ao objeto req
    req.user = decoded;

    // Continue para a próxima rota
    next();
  });
};

// Rota de login
router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Verificar se o usuário existe
  Usuario.findOne({ email })
    .then((usuario) => {
      if (!usuario) {
        // Usuário não encontrado
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      if (usuario.senha !== senha) {
        // Senha incorreta
        return res.status(401).json({ message: 'Senha incorreta' });
      }

      // Senha correta, gerar e enviar token JWT
      const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });

      // Armazena o token em um cookie
      res.cookie('token', token, { httpOnly: true });

      res.redirect('/home');
    })
    .catch((error) => {
      // Erro ao verificar o usuário no banco de dados
      console.error('Erro ao verificar usuário:', error);
      res.status(500).json({ message: 'Erro ao realizar login' });
    });
});

// Rota de registro de usuário
router.post('/cadastro', (req, res) => {
  const { email, senha } = req.body;

  // Verificar se o usuário já está cadastrado
  Usuario.findOne({ email })
    .then((usuarioExistente) => {
      if (usuarioExistente) {
        // Usuário já cadastrado
        return res.status(400).json({ message: 'Usuário já cadastrado' });
      }

      // Criar um novo usuário
      const novoUsuario = new Usuario({ email, senha });

      // Salvar o novo usuário no banco de dados
      novoUsuario.save()
        .then(() => {
          // Cadastro realizado com sucesso
          console.log('Cadastro realizado com sucesso');
          res.redirect('/');
        })
        .catch((error) => {
          // Erro ao salvar o usuário no banco de dados
          console.error('Erro ao salvar usuário:', error);
          res.status(500).json({ message: 'Erro ao cadastrar usuário' });
        });
    })
    .catch((error) => {
      // Erro ao verificar o usuário no banco de dados
      console.error('Erro ao verificar usuário:', error);
      res.status(500).json({ message: 'Erro ao cadastrar usuário' });
    });
});

// Rota de saída
router.get('/sair', (req, res) => {
  // Remova o cookie de token
  res.clearCookie('token');

  // Redirecione para a página inicial ou para onde você desejar
  res.redirect('/');
});

// Rotas protegidas
// router.use(authMiddleware);

router.get('/home',authMiddleware, (req, res) => {
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

router.post('/carga-registros',authMiddleware, async (req, res) => {
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

router.get('/excluir/:id',authMiddleware, (req, res) => {
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

router.post('/registro',authMiddleware, (req, res) => {
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

router.post('/perfil/editar', authMiddleware, (req, res) => {
  const { email, senha } = req.body;
  const userEmail = req.user.email;

  Usuario.findOneAndUpdate({ email: userEmail }, { email, senha })
    .then(() => {
      res.redirect('/perfil');
    })
    .catch((error) => {
      console.error('Erro ao editar perfil:', error);
      res.sendStatus(500);
    });
});

// Rota de exclusão do perfil
router.post('/perfil/excluir', authMiddleware, (req, res) => {
  const userEmail = req.user.email;

  Usuario.findOneAndRemove({ email: userEmail })
    .then(() => {
      // Remova o cookie de token
      res.clearCookie('token');
      res.redirect('/');
    })
    .catch((error) => {
      console.error('Erro ao excluir perfil:', error);
      res.sendStatus(500);
    });
});

router.get('/registrar',authMiddleware, function(req, res) {
  res.render('registrar');
});

router.get('/perfil',authMiddleware, function(req, res) {
  res.render('perfil');
});

router.post('/descricao', (req, res) => {
  res.render('descricao');
});

router.post('/contato/enviar', enviar);

module.exports = router;