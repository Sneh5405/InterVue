const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token && req.cookies) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded; // Adds user info (id, email, role, etc) to request
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token." });
    }
};

module.exports = authenticateToken;
