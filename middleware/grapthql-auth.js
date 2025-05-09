const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      req.isAuth = false;
      return next();
    }
    const token = authHeader.split(' ')[1];
    let decodeToken
    try {
        decodeToken = jwt.verify(token, 'juniorsecret');
    } catch (error) {
        req.isAuth = false;
        return next();
    }
    if (!decodeToken) {
        req.isAuth = false;
        return next();
    }
    req.isAuth = true;
    req.userId = decodeToken.userId;
    next();
}