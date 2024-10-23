const jwt = require('jsonwebtoken');

//  keep the token between 5 minutes
function generateAccessToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '7d',
  });
}

// user will login again each 7 days.
// We'll keep him logged in if he is using the app.
function generateRefreshToken(user, jti) {
  return jwt.sign({
    userId: user.id,
    jti,
  }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d', // seven days
  });
}

function generateTokens(user, jti) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken,
    refreshToken,
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
};
