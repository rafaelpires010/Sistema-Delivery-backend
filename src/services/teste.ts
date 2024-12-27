import nodemailer from "nodemailer";
import { Request, Response } from "express";

export const contato = async (req: Request, res: Response) => {
  // Configuração do transporte do nodemailer
  // Looking to send emails in production? Check out our Email API/SMTP product!
  var transport = nodemailer.createTransport({
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
