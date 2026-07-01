const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
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

// Shared branded layout for transactional emails.
const layout = (heading, bodyHtml) => `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
    <h2 style="color: #E8900A; margin-bottom: 4px;">HonnetKE</h2>
    <h3 style="margin: 8px 0 16px;">${heading}</h3>
    ${bodyHtml}
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
    <p style="color: #999; font-size: 12px;">You are receiving this email because you have a HonnetKE account.</p>
  </div>
`;

const sendBookingAcceptedEmail = async (to, fullName, propertyTitle) =>
  sendMail({
    to,
    subject: 'Your booking request was accepted',
    html: layout('Booking accepted', `
      <p>Hi ${fullName || 'there'},</p>
      <p>Good news: your booking request for "<strong>${propertyTitle}</strong>" has been accepted.</p>
      <p>The provider may follow up with a visit invitation. Keep an eye on your notifications.</p>
    `),
  });

const sendBookingRejectedEmail = async (to, fullName, propertyTitle, reason) =>
  sendMail({
    to,
    subject: 'Update on your booking request',
    html: layout('Booking not accepted', `
      <p>Hi ${fullName || 'there'},</p>
      <p>Your booking request for "<strong>${propertyTitle}</strong>" was not accepted this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Browse other properties on HonnetKE to find your next home.</p>
    `),
  });

const sendVisitInvitationEmail = async (to, fullName, propertyTitle, details) =>
  sendMail({
    to,
    subject: `Visit invitation for ${propertyTitle}`,
    html: layout('You are invited for a visit', `
      <p>Hi ${fullName || 'there'},</p>
      <p>The provider has invited you to visit "<strong>${propertyTitle}</strong>".</p>
      <ul>
        ${details.visitDate ? `<li><strong>Date:</strong> ${details.visitDate}</li>` : ''}
        ${details.visitTime ? `<li><strong>Time:</strong> ${details.visitTime}</li>` : ''}
        ${details.meetingPoint ? `<li><strong>Meeting point:</strong> ${details.meetingPoint}</li>` : ''}
        ${details.visitNotes ? `<li><strong>Notes:</strong> ${details.visitNotes}</li>` : ''}
      </ul>
      ${details.mapLink ? `<p><a href="${details.mapLink}" style="color:#E8900A;">Open location in Google Maps</a></p>` : ''}
    `),
  });

const sendPropertyApprovedEmail = async (to, fullName, propertyTitle) =>
  sendMail({
    to,
    subject: 'Your property is now live',
    html: layout('Property approved', `
      <p>Hi ${fullName || 'there'},</p>
      <p>Your property "<strong>${propertyTitle}</strong>" has been approved and is now live on HonnetKE.</p>
    `),
  });

const sendPropertyRejectedEmail = async (to, fullName, propertyTitle, reason) =>
  sendMail({
    to,
    subject: 'Your property needs changes',
    html: layout('Property not approved', `
      <p>Hi ${fullName || 'there'},</p>
      <p>Your property "<strong>${propertyTitle}</strong>" was not approved.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>You can edit it and re-submit for review.</p>
    `),
  });

const sendWarningEmail = async (to, fullName, reason) =>
  sendMail({
    to,
    subject: 'A warning has been issued on your account',
    html: layout('Account warning', `
      <p>Hi ${fullName || 'there'},</p>
      <p>An administrator has issued a warning on your account.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Repeated violations may lead to suspension.</p>
    `),
  });

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

module.exports = {
  sendMail,
  sendVerificationEmail,
  sendLoginEmail,
  sendResetEmail,
  sendBookingAcceptedEmail,
  sendBookingRejectedEmail,
  sendVisitInvitationEmail,
  sendPropertyApprovedEmail,
  sendPropertyRejectedEmail,
  sendWarningEmail,
};
