import logger from '../config/logger.js';

/**
 * Middleware: forceChangePassword
 * Enforces that users who logged in with a temporary password (mustChangePassword === true)
 * cannot access any API endpoints except password change, logout, and getMe.
 */
export const forceChangePassword = (req, res, next) => {
  if (req.mustChangePassword) {
    const allowedEndpoints = [
      '/api/v1/auth/change-password',
      '/api/auth/change-password',
      '/api/v1/auth/logout',
      '/api/auth/logout',
      '/api/v1/auth/me',
      '/api/auth/me'
    ];

    const currentPath = req.originalUrl || req.path;
    const isAllowed = allowedEndpoints.some(endpoint => currentPath.startsWith(endpoint));

    if (!isAllowed) {
      logger.warn(`[AuthGuard] User ${req.userId} blocked: must change temporary password before accessing ${currentPath}`);
      return res.status(403).json({
        status: 'fail',
        mustChangePassword: true,
        message: 'Security policy violation: You must set a new permanent password before accessing this resource.'
      });
    }
  }

  next();
};

export default forceChangePassword;
