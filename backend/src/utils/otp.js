const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const OTP_TTL_MINUTES = 10;

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

const createOtp = async (email, role, purpose) => {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otp.updateMany({
    where: { email, role, purpose, consumed: false },
    data: { consumed: true },
  });

  await prisma.otp.create({
    data: { email, role, codeHash, purpose, expiresAt },
  });

  return code;
};

const verifyOtpCode = async (email, role, purpose, code) => {
  const record = await prisma.otp.findFirst({
    where: { email, role, purpose, consumed: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) return { ok: false, reason: 'No active code. Please request a new one.' };
  if (record.expiresAt < new Date()) return { ok: false, reason: 'Code has expired. Please request a new one.' };

  const match = await bcrypt.compare(code, record.codeHash);
  if (!match) return { ok: false, reason: 'Invalid code.' };

  await prisma.otp.update({ where: { otpId: record.otpId }, data: { consumed: true } });
  return { ok: true };
};

module.exports = { createOtp, verifyOtpCode, OTP_TTL_MINUTES };
