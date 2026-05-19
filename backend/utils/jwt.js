const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "maai_dev_change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signAuthToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      account_type: user.account_type || user.accountType || "volunteer",
      full_name: user.full_name || user.fullName,
      organization_name: user.organization_name || user.organizationName,
      membership_status: user.membership_status || user.membershipStatus,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

function verifyAuthToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  signAuthToken,
  verifyAuthToken,
};
