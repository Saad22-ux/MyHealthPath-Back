require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendPatientCredentials(email, fullName, password) {
  const mailOptions = {
    from: ` <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Vos identifiants pour le portail patient',
    html: `
      <p>Bonjour ${fullName},</p>
      <p>Votre compte a été créé avec succès. Voici vos informations de connexion :</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Mot de passe:</strong> ${password}</li>
      </ul>
      `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendPatientCredentials };
