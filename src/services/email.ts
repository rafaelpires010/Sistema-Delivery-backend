import nodemailer from "nodemailer";

// Configuração do transporte do nodemailer
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "c906a938cc04d8",
    pass: "6a8f8f38f53dc4",
  },
});

// Função para enviar o e-mail de recuperação de senha
export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string,
  tenantSlug: string
) => {
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
  } catch (error) {
    console.error("Erro ao enviar o e-mail:", error);
    return false;
  }
};
