const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return res.sendStatus(401);
    const token = authHeader
    console.log(token)
    jwt.verify(
        token,
        process.env.JWT_KEY,
        (err, decoded) => {
            if (err) return res.sendStatus(403); //invalid token
            req.user = decoded.userInfo;
            next();
        }
    );
}

module.exports = verifyJWT