import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Supabase JWT verification
const SUPABASE_PROJECT_ID = 'ochfdrtfeawmtbyqvpbw'; // e.g. abcdefghijklmnopqrstuvwxyz
const SUPABASE_JWT_ISSUER = `https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1`;

const client = jwksClient({
  jwksUri: `${SUPABASE_JWT_ISSUER}/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

export const verifySupabaseToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
