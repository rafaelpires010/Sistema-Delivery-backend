"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Configuração do transporte do nodemailer
var transport = nodemailer_1.default.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "c906a938cc04d8",
        pass: "6a8f8f38f53dc4",
    },
});
// Função para enviar o e-mail de recuperação de senha
const sendPasswordResetEmail = async (email, resetLink, tenantSlug) => {
    const mailOptions = {
        from: `"Suporte" <suporte@seusite.com>`, // Remetente
        to: email, // Destinatário
        subject: "Recuperação de Senha",
        html: `
      <p>Você solicitou a recuperação de senha.</p>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetLink}">Redefinir Senha</a>
      <p>Este link é válido por 1 hora.</p>
    `,
    };
    try {
        const info = await transport.sendMail(mailOptions);
        console.log("E-mail enviado:", info);
        return true;
    }
    catch (error) {
        console.error("Erro ao enviar o e-mail:", error);
        return false;
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
