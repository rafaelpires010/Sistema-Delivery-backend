"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contato = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const contato = async (req, res) => {
    // Configuração do transporte do nodemailer
    // Looking to send emails in production? Check out our Email API/SMTP product!
    var transport = nodemailer_1.default.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "c906a938cc04d8",
            pass: "6a8f8f38f53dc4",
        },
    });
    const mailOptions = {
        from: `"Suporte" <suporte@seusite.com>`, // Remetente
        to: "rafapires2210@gmail.com", // Destinatário
        subject: "Recuperação de Senha",
        html: `
      <p>Você solicitou a recuperação de senha.</p>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="https://facebok.com">Redefinir Senha</a>
      <p>Este link é válido por 1 hora.</p>
    `,
    };
    let info = await transport.sendMail(mailOptions);
    console.log("INFO", info);
    res.json({ seccess: true });
};
exports.contato = contato;
