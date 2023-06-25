const Ponto = require("../Model/Ponto");


exports.CargaPontos = async (req, res) => {
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
  };