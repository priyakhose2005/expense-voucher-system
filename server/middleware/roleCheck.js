/**
 * Restrict a route to a set of roles.
 * Usage: roleCheck(['director']) or roleCheck(['director', 'accounts'])
 */
module.exports = function roleCheck(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
};
