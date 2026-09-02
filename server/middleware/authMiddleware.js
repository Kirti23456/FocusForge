// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     // Authorization header check
//     if (!authHeader) {
//       return res.status(401).json({
//         success: false,
//         message: "Authorization header missing",
//       });
//     }

//     // Bearer token
//     const token = authHeader.startsWith("Bearer ")
//       ? authHeader.split(" ")[1]
//       : authHeader;

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Token missing",
//       });
//     }

//     // Verify JWT
//     const decoded = jwt.verify(
//   token,
//   process.env.JWT_SECRET
// );

// console.log("===== JWT DEBUG =====");
// console.log("Decoded token:", decoded);
// console.log("=====================");

// req.user = {
//   id: decoded.id,
// };

// next();

//   } catch (error) {
//     console.error(
//       "Auth Middleware Error:",
//       error.message
//     );

//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token",
//     });
//   }
// };

// module.exports = authMiddleware;


const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // =====================================================
    // AUTHORIZATION HEADER
    // =====================================================

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    // =====================================================
    // BEARER TOKEN
    // =====================================================

    let token;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      token = authHeader;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // =====================================================
    // JWT VERIFY
    // =====================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("===== JWT DEBUG =====");
    console.log("Decoded token:", decoded);
    console.log("=====================");

    // =====================================================
    // USER
    // =====================================================

    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
    };

    if (!req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    next();

  } catch (error) {
    console.error(
      "Auth Middleware Error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;