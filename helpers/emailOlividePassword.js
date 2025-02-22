import nodemailer from 'nodemailer'

const emailOlvidePassword = async (datos) => {
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
    const { email, nombre, token} = datos
    // Enviar el email
    const info = await transporter.sendMail({
        from: "APV - Administrador de pacientes de veterinaria",
        to: email,
        subject: "Reestablece tu Passwword",
        text: "Reestablece tu Passwword",
        html:`<p> hola: ${nombre} has solicitado restablecer tu password</p>
        <p>Sigue el siguiente enlace para generar un nuevo password:
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}"> Restablecer Password</a> </p>
        
        <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>`,
    });

    console.log("mensaje enviado: %s", info.messageId);
    
    
}

export default emailOlvidePassword
