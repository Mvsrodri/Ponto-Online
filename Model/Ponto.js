var mongoose = require('mongoose');

var pontoSchema = new mongoose.Schema({
    data: { type: Date, default: Date.now },
    entrada1: String,
    saida1: String,
    entrada2: String,
    saida2: String
});

const Ponto = mongoose.model('Ponto', pontoSchema);

module.exports = Ponto;