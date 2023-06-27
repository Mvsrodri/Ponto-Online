const Ponto = require("../Model/Ponto");

// Função para registrar o ponto
exports.RegistrarPonto = (req, res) => {
    const entrada1 = req.body.entrada1;
    const saida1 = req.body.saida1;
    const entrada2 = req.body.entrada2;
    const saida2 = req.body.saida2;
  
    // Validar horários
    if (saida1 < entrada1 || entrada2 < saida1 || saida2 < entrada1 || saida2 < saida1) {
      console.error('Horários inválidos');
      return res.status(400).json({ message: 'Horários inválidos' });
    }
  
    const novaData = new Date();
    // Verificar se já existe um ponto registrado para a data atual
    Ponto.findOne({ data: { $gte: novaData.setHours(0, 0, 0, 0), $lte: novaData.setHours(23, 59, 59, 999) } })
      .then((pontoExistente) => {
        if (pontoExistente) {
          console.error('Já existe um ponto registrado para esta data');
          return res.status(409).json({ message: 'Já existe um ponto registrado para esta data' }); // Conflito - Data já registrada
        }
        // Criar um novo registro de ponto
        const ponto = new Ponto({
          data: novaData,
          entrada1: req.body.entrada1,
          saida1: req.body.saida1,
          entrada2: req.body.entrada2,
          saida2: req.body.saida2
        });
        // Salvar o novo registro de ponto no banco de dados
        ponto.save()
          .then(() => {
            res.redirect('/home');
          })
          .catch((err) => {
            console.error('Erro ao registrar ponto:', err);
            res.status(500).json({ message: 'Erro ao registrar ponto' });
          });
      })
      .catch((err) => {
        console.error('Erro ao buscar ponto existente:', err);
        res.status(500).json({ message: 'Erro ao buscar ponto existente' });
      });
  };


//Função para Exibir os Pontos na Pagina inicial
exports.ExibirPontos = (req, res) => {
    const { ordenacao } = req.query;

    // Função auxiliar para ordenar os pontos por data
    const ordenarPorData = (pontos) => {
      if (ordenacao === 'asc') {
        return pontos.sort((a, b) => a.data - b.data);
      } else if (ordenacao === 'desc') {
        return pontos.sort((a, b) => b.data - a.data);
      } else {
        return pontos; // Não especificado, mantenha a ordem original
      }
    };

    // Buscar todos os pontos no banco de dados
    Ponto.find()
      .then((pontos) => {
        // Formatar a data de cada ponto para exibição
        pontos.forEach((ponto) => {
          ponto.dataFormatada = ponto.data.toLocaleDateString('pt-BR');
        });
  
        const pontosOrdenados = ordenarPorData(pontos); // Chamar a função de ordenação
        
        // Renderizar a página inicial passando os pontos ordenados para o template
        res.render('home', { pontos: pontosOrdenados });
      })
      .catch((err) => {
        console.error('Erro ao buscar os pontos:', err);
        res.sendStatus(500);
      });
};
// Função para editar um registro de ponto
exports.EditarPonto = (req, res) => {
  const pontoId = req.params.id;
  const entrada1 = req.body.entrada1;
  const saida1 = req.body.saida1;
  const entrada2 = req.body.entrada2;
  const saida2 = req.body.saida2;

  // Validar horários
  if (saida1 < entrada1 || entrada2 < saida1 || saida2 < entrada1 || saida2 < saida1) {
    console.error('Horários inválidos');
    return res.status(400).json({ message: 'Horários inválidos' });
  }
  // Encontrar e atualizar o registro de ponto pelo ID
  Ponto.findByIdAndUpdate(pontoId, {
    entrada1: entrada1,
    saida1: saida1,
    entrada2: entrada2,
    saida2: saida2
  })
    .then(() => {
      res.redirect('/home');
    })
    .catch((err) => {
      console.error('Erro ao editar o ponto:', err);
      res.status(500).json({ message: 'Erro ao editar o ponto' });
    });
};

// Função para excluir um registro de ponto
exports.ExcluirPontos = (req, res) => {
    const pontoId = req.params.id;
    
    // Encontrar e remover o registro de ponto pelo ID
    Ponto.findByIdAndRemove(pontoId)
      .then(() => {
        res.redirect('/home');
      })
      .catch((err) => {
        console.error('Erro ao excluir o registro de ponto:', err);
        res.status(500).json({ message: 'Erro ao excluir o registro de ponto' });
      });
};

// Função para exibir a página de edição de um ponto
exports.ExibirPontoEditar = (req, res) => {
  const pontoId = req.params.id;
  
  // Encontrar o registro de ponto pelo ID
  Ponto.findById(pontoId)
    .then((ponto) => {
      res.render('editar', { ponto: ponto });
    })
    .catch((err) => {
      console.error('Erro ao buscar o ponto:', err);
      res.sendStatus(500);
    });
};