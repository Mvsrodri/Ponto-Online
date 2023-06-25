const Usuario = require('../Model/Usuario');
const secretKey = process.env.SECRET_KEY;
const jwt = require('jsonwebtoken');

exports.Login = (req, res) => {
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
};

exports.Sair = (req, res) => {
  // Remova o cookie de token
  res.clearCookie('token');
  // Redirecione para a página inicial ou para onde você desejar
  res.redirect('/');
};