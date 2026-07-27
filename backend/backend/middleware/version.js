/**
 * API Version Negotiation Middleware
 * Evaluates Accept-Version header or URL prefix for v1 routing.
 */
export const versionNegotiation = (supportedVersions = ['v1']) => {
  return (req, res, next) => {
    const requestedVersion = req.headers['accept-version'] || 'v1';
    
    if (!supportedVersions.includes(requestedVersion.toLowerCase())) {
      return res.status(400).json({
        status: 'fail',
        message: `Requested API version '${requestedVersion}' is not supported. Supported versions: ${supportedVersions.join(', ')}`
      });
    }

    req.apiVersion = requestedVersion.toLowerCase();
    res.setHeader('API-Version', req.apiVersion);
    next();
  };
};

export default versionNegotiation;
