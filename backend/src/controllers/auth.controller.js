// Sprint 1 — Auth

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { createOtp, verifyOtpCode } = require('../utils/otp');
const { sendVerificationEmail, sendLoginEmail, sendResetEmail } = require('../utils/mailer');

const SELF_REGISTER_ROLES = ['student', 'landlord', 'agent'];

// role → prisma delegate + primary key field
const ROLE_MAP = {
  student: { model: () => prisma.student, idField: 'studentId' },
  landlord: { model: () => prisma.landlord, idField: 'landlordId' },
  agent: { model: () => prisma.agent, idField: 'agentId' },
  admin: { model: () => prisma.admin, idField: 'adminId' },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Find a user by email across all role tables. Returns { user, role, config } or null.
const findUserByEmail = async (email) => {
  for (const role of Object.keys(ROLE_MAP)) {
    const config = ROLE_MAP[role];
    const user = await config.model().findUnique({ where: { email } });
    if (user) return { user, role, config };
  }
  return null;
};

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const publicUser = (user, role, config) => ({
  id: user[config.idField],
  fullName: user.fullName,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role,
});

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    if (!fullName || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    if (!SELF_REGISTER_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Role must be one of: student, landlord, agent.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const config = ROLE_MAP[role];

    const user = await config.model().create({
      data: { fullName, email, phoneNumber, passwordHash, isVerified: false },
    });

    const code = await createOtp(email, role, 'verify');
    await sendVerificationEmail(email, fullName, code);

    return res.status(201).json({
      message: 'Account created. Check your email for a verification code.',
      email,
      role,
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Email or phone number already in use.' });
    }
    return next(err);
  }
};

// POST /api/auth/verify-otp  — completes registration ('verify') or login 2FA ('login')
const verifyOtp = async (req, res, next) => {
  try {
    const { email, role, code } = req.body;
    const purpose = req.body.purpose === 'login' ? 'login' : 'verify';

    if (!email || !role || !code) {
      return res.status(400).json({ message: 'Email, role, and code are required.' });
    }
    if (!ROLE_MAP[role]) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    if (purpose === 'verify' && !SELF_REGISTER_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role for verification.' });
    }

    const result = await verifyOtpCode(email, role, purpose, code);
    if (!result.ok) {
      return res.status(400).json({ message: result.reason });
    }

    const config = ROLE_MAP[role];
    let user;
    if (purpose === 'verify') {
      user = await config.model().update({ where: { email }, data: { isVerified: true } });
    } else {
      user = await config.model().findUnique({ where: { email } });
    }

    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    const token = signToken(user[config.idField], role);

    return res.json({
      message: purpose === 'verify' ? 'Account verified successfully.' : 'Login successful.',
      token,
      user: publicUser(user, role, config),
    });
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const found = await findUserByEmail(email);
    if (!found) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const { user, role, config } = found;

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Contact support.' });
    }

    // 2FA: validate password, then email a one-time code. The JWT is only
    // issued after the code is confirmed at /verify-otp.
    // Unverified self-registered users complete the 'verify' flow instead.
    const needsVerify = SELF_REGISTER_ROLES.includes(role) && !user.isVerified;
    const purpose = needsVerify ? 'verify' : 'login';

    const otpCode = await createOtp(email, role, purpose);
    console.log(`[DEV] OTP for ${email} (${purpose}): ${otpCode}`);
    if (purpose === 'verify') {
      await sendVerificationEmail(email, user.fullName, otpCode);
    } else {
      await sendLoginEmail(email, user.fullName, otpCode);
    }

    return res.json({
      message: needsVerify
        ? 'Account not verified. We sent a verification code to your email.'
        : 'Credentials accepted. We sent a login code to your email.',
      needsOtp: true,
      purpose,
      email,
      role,
    });
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/resend-otp  — re-issues a code for an in-progress verify/login flow
const resendOtp = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const purpose = req.body.purpose === 'login' ? 'login' : 'verify';

    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required.' });
    }
    if (!ROLE_MAP[role]) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const config = ROLE_MAP[role];
    const user = await config.model().findUnique({ where: { email } });

    // Don't reveal whether the account exists; respond the same either way.
    if (user) {
      const code = await createOtp(email, role, purpose);
      if (purpose === 'login') {
        await sendLoginEmail(email, user.fullName, code);
      } else {
        await sendVerificationEmail(email, user.fullName, code);
      }
    }

    return res.json({ message: 'If the account exists, a new code has been sent.' });
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const found = await findUserByEmail(email);

    // Only send if the account exists, but always respond the same way (no enumeration).
    if (found && found.role !== 'admin') {
      const code = await createOtp(email, found.role, 'reset');
      await sendResetEmail(email, found.user.fullName, code);
    }

    return res.json({
      message: 'If an account exists for that email, a reset code has been sent.',
    });
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code, and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const found = await findUserByEmail(email);
    if (!found || found.role === 'admin') {
      return res.status(400).json({ message: 'Invalid reset request.' });
    }

    const { role, config } = found;
    const result = await verifyOtpCode(email, role, 'reset', code);
    if (!result.ok) {
      return res.status(400).json({ message: result.reason });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await config.model().update({ where: { email }, data: { passwordHash } });

    return res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/logout  (stateless JWT — client discards token)
const logout = async (req, res) => {
  return res.json({ message: 'Logged out successfully.' });
};

module.exports = { register, verifyOtp, resendOtp, login, forgotPassword, resetPassword, logout };
