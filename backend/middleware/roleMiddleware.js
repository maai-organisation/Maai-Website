function allowRoles(...roles) {
  const allowedRoles = new Set(roles);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication is required." });
    }

    if (!allowedRoles.has(req.user.role)) {
      return res.status(403).json({ success: false, message: "You do not have access to this resource." });
    }

    return next();
  };
}

module.exports = {
  allowRoles,
  authorizeRoles: allowRoles,
};
