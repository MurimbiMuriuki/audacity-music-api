const jwt = require("jsonwebtoken");
const config = require("../../../config/db.config.js");

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res
      .status(200)
      .send({ status: false, message: "No access token provided!", data: {} });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(200).send({
        status: false,
        message: "Access token is expired! Login again",
        errorCode: 601,
        data: {},
      });
    }

    req.userId = decoded.id;
    req.userName = decoded.name;
    req.role = decoded.role;
    next();
  });
};

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, name: user.firstName, role: user.role }, config.secret, {
    expiresIn: "5d",
  });
};

const authJwt = {
  verifyToken,
  generateAccessToken
};

module.exports = authJwt;
