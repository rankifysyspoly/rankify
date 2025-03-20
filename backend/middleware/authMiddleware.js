// const jwt = require("jsonwebtoken");

// exports.protect = (req, res, next) => {
//   let token = req.headers.authorization;

//   if (!token || !token.startsWith("Bearer")) {
//     return res.status(401).json({ message: "Not authorized, no token" });
//   }

//   try {
//     token = token.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Not authorized, invalid token" });
//   }
// };
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Invalid token" });
  }
};
