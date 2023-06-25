const Ponto = require("../Model/Ponto");

exports.RegistrarPonto = (req, res) => {
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
  };


//Função para Exibir os Pontos na Pagina inicial
exports.ExibirPontos = (req, res) => {
    const { ordenacao } = req.query;
  
    const ordenarPorData = (pontos) => {
      if (ordenacao === 'asc') {
        return pontos.sort((a, b) => a.data - b.data);
      } else if (ordenacao === 'desc') {
        return pontos.sort((a, b) => b.data - a.data);
      } else {
        return pontos; // Não especificado, mantenha a ordem original
      }
    };
  
    Ponto.find()
      .then((pontos) => {
        pontos.forEach((ponto) => {
          ponto.dataFormatada = ponto.data.toLocaleDateString('pt-BR');
        });
  
        const pontosOrdenados = ordenarPorData(pontos); // Chamar a função de ordenação
  
        res.render('home', { pontos: pontosOrdenados }); // Passar os pontos ordenados para o template
      })
      .catch((err) => {
        console.error('Erro ao buscar os pontos:', err);
        res.sendStatus(500);
      });
};

exports.EditarPonto = (req, res) => {
  const pontoId = req.params.id;
  const entrada1 = req.body.entrada1;
  const saida1 = req.body.saida1;
  const entrada2 = req.body.entrada2;
  const saida2 = req.body.saida2;

  // Validar horários
  if (saida1 < entrada1 || entrada2 < saida1 || saida2 < entrada1 || saida2 < saida1) {
    console.error('Horários inválidos');
    return res.sendStatus(400);
  }

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
      res.sendStatus(500);
    });
};

exports.ExcluirPontos = (req, res) => {
    const pontoId = req.params.id;
  
    Ponto.findByIdAndRemove(pontoId)
      .then(() => {
        res.redirect('/home');
      })
      .catch((err) => {
        console.error('Erro ao excluir o registro de ponto:', err);
        res.sendStatus(500);
      });
};

exports.ExibirPontoEditar = (req, res) => {
  const pontoId = req.params.id;

  Ponto.findById(pontoId)
    .then((ponto) => {
      res.render('editar', { ponto: ponto });
    })
    .catch((err) => {
      console.error('Erro ao buscar o ponto:', err);
      res.sendStatus(500);
    });
};