const Usuario = require('../Model/Usuario');
const secretKey = process.env.SECRET_KEY;
const jwt = require('jsonwebtoken');



exports.authMiddleware = (req, res, next) => {
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
        
        // Redireciona para a página inicial
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