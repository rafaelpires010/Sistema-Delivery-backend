import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Função para enviar o e-mail de recuperação de senha
export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string,
  tenantSlug: string,
  img: string,
  main_color: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${tenantSlug} <equipe@bevon.com.br>`,
      to: [email],
      subject: "Recuperação de Senha",
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
  
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="${img}" alt="Logo de ${tenantSlug}" style="max-width: 140px; height: auto; margin-bottom: 20px;">
    <h1 style="color: #333333; margin-bottom: 10px;">Redefina sua Senha</h1>
    <p style="color: #666666;">Recebemos uma solicitação para redefinir a senha da sua conta.</p>
  </div>

  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
    <h2 style="color: #333333; margin-bottom: 15px;">Ação Necessária</h2>
    <p style="color: #444444; margin-bottom: 20px;">Clique no botão abaixo para escolher uma nova senha. Este link é válido por 1 hora.</p>
    <a href="${resetLink}" 
       style="background-color: ${main_color}; color: white; padding: 12px 24px; 
              text-decoration: none; border-radius: 4px; display: inline-block;
              font-weight: bold;">
      Redefinir Senha
    </a>
  </div>

  <div style="text-align: center; color: #666666; font-size: 14px; border-top: 1px solid #eeeeee; padding-top: 20px;">
    <p style="margin: 0 0 10px;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
    <p style="margin: 0 0 15px; word-break: break-all;"><a href="${resetLink}" style="color: ${main_color}; text-decoration: none;">${resetLink}</a></p>
    <p style="margin: 0;">Se você não solicitou a redefinição, por favor, ignore este e-mail.</p>
  </div>
</div>
      `,
    });

    if (error) {
      console.error("Erro ao enviar o e-mail:", error);
      return false;
    }

    console.log("E-mail enviado:", data);
    return true;
  } catch (error) {
    console.error("Erro ao enviar o e-mail:", error);
    return false;
  }
};
