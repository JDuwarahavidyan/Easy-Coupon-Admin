const admin = require('firebase-admin');

const verify = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).json("Token is missing");

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (!decodedToken.isAdmin) {
            return res.status(403).json("Access denied. Admins only.");
        }
        req.user = decodedToken;
        next();
    } catch (err) {
        res.status(403).json("Invalid token");
    }
};


module.exports = verify;