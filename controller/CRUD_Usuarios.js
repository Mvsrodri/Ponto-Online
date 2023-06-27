const Usuario = require('../Model/Usuario');

// Função de cadastro do perfil
exports.CadastrarUsuario = (req, res) => {
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
};
// Função de edição do perfil
exports.EditarUsuario = (req, res) => {
    const { email, senha } = req.body;
    const userEmail = req.user.email;
    
    // Procura e atualiza o documento do usuário com o email correspondente
    Usuario.findOneAndUpdate({ email: userEmail }, { email, senha })
      .then(() => {
        // Redireciona para a página de perfil após a edição
        res.redirect('/perfil');
      })
      .catch((error) => {
        // Erro ao editar o perfil, retorna um status de erro
        console.error('Erro ao editar perfil:', error);
        res.status(500).json({ message: 'Erro ao editar perfil' });
      });
};
  
// Função de exclusão do perfil
exports.ExcluirUsuario = (req, res) => {
    const userEmail = req.user.email;
  
    Usuario.findOneAndRemove({ email: userEmail })
      .then(() => {
        // Remova o cookie de token
        res.clearCookie('token');
        res.redirect('/');
      })
      .catch((error) => {
        console.error('Erro ao excluir perfil:', error);
        res.status(500).json({ message: 'Erro ao excluir perfil' });
      });
};
