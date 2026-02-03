const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  console.log("Authorization Header:", authHeader);

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      token = authHeader.split(" ")[1];
      console.log("Token extracted:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded:", decoded);

      req.user = await User.findById(decoded.user.id).select("-password");

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
};

//middleware to check user is admin

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin'){
        next();
    } else {
        res.status(403).json({message:"Not authorized as an admin"});
    }
};

module.exports = {protect, admin};

