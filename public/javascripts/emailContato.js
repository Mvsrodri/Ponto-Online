const nodemailer = require('nodemailer');


exports.enviar = (req, res) => {
    const { nome, email, assunto, mensagem } = req.body;
    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "e9422849ad0ee2",
          pass: "f14321f430cc20"
        }
    });
    
    var message = {
      from: "noreply@local.com.br",
      to: "marcos@local.com.br",
      subject: "E-mail Contato",
      text: `Nome: ${nome}\nE-mail: ${email}\nAssunto: ${assunto}\n\nMensagem:${mensagem}`,
    };
    transport.sendMail(message,(error, info) => {
        if (error) {
            console.log(error);
            // Exibir mensagem de erro em um pop-up
            res.send('<script>alert("Ocorreu um erro ao enviar a mensagem."); window.location.href = "/contato";</script>');
          } else {
            console.log('E-mail enviado: ' + info.response);
            // Exibir mensagem de sucesso em um pop-up e redirecionar para a página de contato
            res.send('<script>alert("E-mail enviado com sucesso!"); window.location.href = "/contato";</script>');
          }
    });
};