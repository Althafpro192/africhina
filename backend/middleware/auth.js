import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.mustChangePassword = decoded.mustChangePassword || false;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Require Admin Role' });
  }
  next();
};

export const ensurePasswordChanged = (req, res, next) => {
  if (req.mustChangePassword) {
    // Allow access only to change password or logout routes
    const allowedPaths = ['/change-password', '/set-new-password', '/logout', '/me'];
    const pathMatches = allowedPaths.some(p => req.path.endsWith(p));
    
    if (!pathMatches) {
      return res.status(403).json({
        mustChangePassword: true,
        message: 'You must update your temporary password before accessing application resources.'
      });
    }
  }
  next();
};
