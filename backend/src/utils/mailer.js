const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const FROM = process.env.MAIL_FROM || 'HonnetKE <no-reply@honnetke.com>';

const sendMail = async ({ to, subject, html }) => {
  return transporter.sendMail({ from: FROM, to, subject, html });
};

const otpEmailTemplate = (fullName, code, intro) => `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
    <h2 style="color: #E8900A; margin-bottom: 8px;">HonnetKE</h2>
    <p>Hi ${fullName || 'there'},</p>
    <p>${intro}</p>
    <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background: #FFF8EC; border: 1px solid #E8900A; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
      ${code}
    </div>
    <p style="color: #666; font-size: 14px;">This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.</p>
  </div>
`;

const sendVerificationEmail = async (to, fullName, code) =>
  sendMail({
    to,
    subject: 'Verify your HonnetKE account',
    html: otpEmailTemplate(fullName, code, 'Use the code below to verify your account and join the Hive:'),
  });

const sendLoginEmail = async (to, fullName, code) =>
  sendMail({
    to,
    subject: 'Your HonnetKE login code',
    html: otpEmailTemplate(fullName, code, 'Use the code below to finish signing in:'),
  });

const sendResetEmail = async (to, fullName, code) =>
  sendMail({
    to,
    subject: 'Reset your HonnetKE password',
    html: otpEmailTemplate(fullName, code, 'Use the code below to reset your password:'),
  });

module.exports = { sendMail, sendVerificationEmail, sendLoginEmail, sendResetEmail };
