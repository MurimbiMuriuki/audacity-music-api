const jwt = require("jsonwebtoken");
const config = require("../../../config/db.config.js");

// verifyToken = (req, res, next) => {
//   let token = req.headers["x-access-token"];

//   if (!token) {
//     return res
//       .status(200)
//       .send({ status: false, message: "No access token provided!", data: {} });
//   }

//   jwt.verify(token, config.secret, (err, decoded) => {
//     if (err) {
//       return res.status(200).send({
//         status: false,
//         message: "Access token is expired! Login again",
//         errorCode: 601,
//         data: {},
//       });
//     }
//     req.userId = decoded.id;
//     req.userName = decoded.name;
//     // req.role = decoded.role
//     next();
//   });
// };
verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res
      .status(200)
      .send({ status: false, message: "No access token provided!", data: {} });
  }

  // ✅ Remove 'Bearer ' prefix if present
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

generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, name: user.firstName, role:user.role }, config.secret, {
    expiresIn: "5d", //2 minutes
  });
};



const authJwt = {
  verifyToken: verifyToken,
  generateAccessToken: generateAccessToken
};
module.exports = authJwt;
