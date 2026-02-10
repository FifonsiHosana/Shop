const express = require("express");
const User = require("../models/User");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");

//@route POST/api/users/register
//@access Public
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Registration
    let user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ name, email, password });
    await user.save();

    // create JWT payload
    const payload = { user: { id: user._id, role: user.role } };

    // sign and return the token with user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) {
          console.error("JWT Sign Error:", err);
          return res.status(500).json({ message: "Error generating token" });
        }
        //else send user & response
        res.status(201).json({
          user: {
            _id: user._id,
            name: user.name, 
            email: user.email,
            role: user.role,
          },
          token,
        });
      },
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // create JWT payload
    const payload = { user: { id: user._id, role: user.role } };

    // sign and return the token with user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) {
          console.error("JWT Sign Error:", err);
          return res.status(500).json({ message: "Error generating token" });
        }
        //else send user & response
        res.status(200).json({
          // Changed from 201 to 200
          user: {
            _id: user._id,
            name: user.name, // Fixed typo: was 'mane'
            email: user.email,
            role: user.role,
          },
          token,
        });
      },
    );
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route Get /api/users/profile
//@desc Get user's profile
//@access private
router.get("/profile", protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
