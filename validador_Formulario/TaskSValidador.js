//Importação do @hapi/joi para validar os dados do formulario de login
const Joi = require("@hapi/joi");

//Função taskschema para validar os dados inseridos em email e senha
const TaskSchema = Joi.object({
  email:Joi.string().email().required(),
  senha: Joi.string().min(1).max(10).required(),
}).with("email","senha");


module.exports = TaskSchema