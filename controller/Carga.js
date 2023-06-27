const Ponto = require("../Model/Ponto");

// Função para carregar pontos
exports.CargaPontos = async (req, res) => {
    const pontos = [];
  
    const dataAtual = new Date();
    const decrementoDias = 1;
    const maxTentativas = 10;
    let tentativas = 0;
    
    // Loop para criar e registrar pontos em datas específicas
    for (let i = 0; i < 5; i++) {
      let novaData;
      let pontoExistente;
      
      // Encontrar uma nova data disponível para registro
      do {
        novaData = new Date(dataAtual.getTime() - i * decrementoDias * 24 * 60 * 60 * 1000);
        novaData.setHours(0, 0, 0, 0); // Definir horários para 00:00:00
        pontoExistente = await Ponto.findOne({ data: novaData });
        tentativas++;
      } while (pontoExistente && tentativas < maxTentativas);
      
      // Verificar se a quantidade de tentativas excedeu o limite
      if (tentativas >= maxTentativas) {
        console.error('Não foi possível encontrar uma nova data disponível para registro');
        return res.sendStatus(500);
      }
      
      // Verificar se já existe um ponto registrado com a mesma data
      const pontosExistenteMesmaData = await Ponto.find({ data: { $eq: novaData } });
  
      if (pontosExistenteMesmaData.length > 0) {
        console.error('Ponto já registrado com a mesma data');
        return res.sendStatus(400);
      }
      
      // Criar um novo ponto com horários predefinidos
      const ponto = new Ponto({
        data: novaData,
        entrada1: '09:00',
        saida1: '12:00',
        entrada2: '13:00',
        saida2: '18:00'
      });
  
      pontos.push(ponto);// Adicionar o novo ponto ao array de pontos
    }
    
    // Inserir os pontos no banco de dados
    Ponto.insertMany(pontos)
      .then(() => {
        res.redirect('/home'); // Redirecionar para a página inicial após o carregamento dos registros
      })
      .catch((err) => {
        console.error('Erro ao carregar registros:', err);
        res.sendStatus(500);
      });
  };