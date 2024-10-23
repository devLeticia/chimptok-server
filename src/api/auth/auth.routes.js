const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById,
  findUserByConfirmationCode,
  confirmUserEmail,
  // findUserByResetCode,
  // updateUserPassword,
  revokeRefreshTokens,
  saveCancelationReason,
  getCancelationReasons,
  deleteUser,
  updateUserResetToken,
  findUserByResetToken,
  updateUserPassword,
} = require('../users/users.services');
const { generateTokens } = require('../../utils/jwt');
const {
  addRefreshTokenToWhitelist,
  findRefreshTokenById,
  deleteRefreshToken,
  revokeTokens,
} = require('./auth.services');
const { hashToken } = require('../../utils/hashToken');
const nodemailer = require('../../utils/nodemailer.config');

const { registerSchema } = require('../../validators/auth.validator');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  // depois posso transformar essas validações em arquivos separados
  // https://zod.dev/
  // https://emaillistvalidation.com/blog/email-validation-with-zod/

  try {
    const { email, password, username } = registerSchema.parse(req.body);
     if (!email || !password || !username) {
      res.status(500);
      throw new Error('You must provide an email and a password.');
     }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(500);
      throw new Error('Email already in use.');
    }

    // colocar essa geraão de confirmationCode na parte de JWT com as outras funções
    const confirmationCode = jwt.sign(email, process.env.JWT_ACCESS_SECRET);
    const user = await createUserByEmailAndPassword({
      email, password, username, confirmationCode,
    });

    
    nodemailer.sendConfirmationEmail(
      user.username,
      user.email,
      user.confirmationCode,
    );
    const createdUser = await findUserByEmail(email);
    res.json({
      createdUser,
    });
  } catch (err) {
    next(err);
  }
});

// endpoint pra poder reenviar email de confirmação caso tenha dado problema
// só vai poder ser enviado se o ema-il estiver cadastrado
router.post('/sendEmailConfirmation', async (req, res, next) => {
  try {
    const { email } = req.body;
    const userToSendConfirmation = await findUserByEmail(email);
    if (!userToSendConfirmation) {
      res.status(400);
      throw new Error('Email already in use.');
    }
    nodemailer.sendConfirmationEmail(
      userToSendConfirmation.username,
      userToSendConfirmation.email,
      userToSendConfirmation.confirmationCode,
    );
  } catch (err) {
    next(err);
  }
});

router.get('/confirm/:confirmationCode', async (req, res, next) => {
  try {
    let { confirmationCode } = req.params;
    confirmationCode = Buffer.from(confirmationCode, 'base64').toString('ascii');
    const user = await findUserByConfirmationCode(confirmationCode);

    if (!user) {
      return res.status(404).send({ message: 'User Not found.' });
    }
    const confirmation = await confirmUserEmail(confirmationCode);

    if (!confirmation) {
      return res.status(403).send({ message: 'User Not found.' });
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

    res.json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
  return null;
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    if (!existingUser.emailConfirmed) {
      res.status(401).send({
        message: 'Pending Account. Please Verify Your Email!',
      });
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: existingUser.id });

    userInfo = {
      name: existingUser.username,
      email: existingUser.email,
      createdAt: existingUser.createdAt,
    }

    res.json({
      accessToken,
      refreshToken,
      userInfo
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).send({ message: 'User Not found.' });
    }

    await revokeRefreshTokens(userId);

    // Respond with a success message
    return res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    next(err);
  }
  return null;
});

router.post('/refreshToken', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Missing refresh token.');
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const savedRefreshToken = await findRefreshTokenById(payload.jti);

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken: newRefreshToken, userId: user.id });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// This endpoint is only for demo purpose.
// Move this logic where you need to revoke the tokens( for ex, on password reset)
router.post('/revokeRefreshTokens', async (req, res, next) => {
  try {
    const { userId } = req.body;
    await revokeTokens(userId);
    res.json({ message: `Tokens revoked for user with id #${userId}` });
  } catch (err) {
    next(err);
  }
});


router.post('/reset-passord', async (req, res, next) => {
   const { token, newPassword } = req.body;

  // Find the user by the token and check if it's still valid
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpiry: { $gt: Date.now() }, // Token hasn't expired
  });

  if (!user) {
    return res.status(500).json({ message: 'Invalid or expired reset token' });
  }

  // If valid, hash the new password and save it
  user.password = await hashPassword(newPassword); // Replace with your password hashing logic
  user.passwordResetToken = undefined; // Clear the token
  user.passwordResetTokenExpiry = undefined;
  
  await user.save();

  return res.status(200).json({ message: 'Password reset successful' });
});

router.post('/cancel', async (req, res, next) => {
  try {
    // primeiro, verificar se usuario existe na base
    const { userId, reasonsToCancel, comments } = req.body;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).send({ message: 'User Not found.' });
    }

    // se existe, salvar os motivos de cancelmaneto na tabela de cancelation
    await saveCancelationReason(user, reasonsToCancel, comments)
    // após salvar o cancelamento, deletar o usuario e toda sua info no 

    await deleteUser(userId);

    return res.status(200).json({ message: 'conta cancelada, usuario deletado.' });
  } catch (err) {
    next(err);
  }
});

router.get('/cancellation-reasons', async (req, res) => {
  try {
    const reasons = await getCancelationReasons();
    res.json(reasons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cancellation reasons' });
  }
});

// Route for "forgot password"
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if the email exists in the database
    const user = await findUserByEmail(email);
    if (!user) {
      // Generic response to prevent email enumeration attacks
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate the token and save its hashed version in the database
    const { resetToken, hashedToken } = await generateResetToken();
    const tokenExpiry = Date.now() + 3600000; // 1 hour expiration

    // Save the hashed token and expiry to the user's record
    await updateUserResetToken(user.email, hashedToken, tokenExpiry);

    // Send the reset token to the user's email
    nodemailer.sendPasswordResetEmail(user.username, user.email, resetToken);

    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
});


// Route for resetting the password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Look up the user based on the reset token (hash stored in DB)
    const user = await findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if the token has expired
    if (user.passwordResetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Verify the reset token
    const validToken = await bcrypt.compare(token, user.passwordResetToken);
    if (!validToken) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token/expiry
    await updateUserPassword(user.id, hashedPassword);

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
});

const generateResetToken = async () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(resetToken, 10); // Hash the token before saving
  return { resetToken, hashedToken };
};



module.exports = router;
