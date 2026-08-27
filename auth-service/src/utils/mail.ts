import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

export const sendResetEmail = async (to: string, resetLink: string) => {
  try {
    await transporter.sendMail({
      from: '"Catálogo Tom Hanks" <noreply@lapps.studio>',
      to,
      subject: 'Recuperação de Senha',
      text: `Você solicitou a recuperação de senha. Clique no link para redefinir: ${resetLink} \n\nEste link expira em 30 minutos.`,
      html: `<p>Você solicitou a recuperação de senha.</p><p><a href="${resetLink}">Clique aqui para redefinir sua senha</a></p><p><small>Este link expira em 30 minutos.</small></p>`
    });
    console.log(`Email de recuperação enviado para ${to}`);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error('Falha no envio de email');
  }
};
