// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// require("dotenv").config();

// const router = express.Router();

// // Signup
// router.post("/signup", async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });
//     if (user) return res.status(400).json({ msg: "User already exists" });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     user = new User({ name, email, password: hashedPassword });
//     await user.save();

//     res.status(201).json({ msg: "User registered successfully" });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// });


// // Signin
// router.post("/signin", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//     res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// module.exports = router;





const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware"); // Middleware for protected routes
const twilio = require("twilio");
const OTP = require("../models/OTP");
require("dotenv").config();

const router = express.Router();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Signup (Register a new user)
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ msg: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});
// Signin (Login user)  
router.post("/signin", async (req, res) => {
  const { email, password,phone } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }



  // Check if the user exists
  let user = await User.findOne({ phone });
  if (!user) return res.status(400).json({ message: "User not found" });

  // Generate a 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000);

  // Save OTP in database
  const otpEntry = new OTP({ phone, code: otpCode, expiresAt: Date.now() + 5 * 60 * 1000 });
  await otpEntry.save();

  // Send OTP via Twilio
  try {
      await client.messages.create({
          body: `Your OTP is ${otpCode}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
      });
      res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
      res.status(500).json({ message: "Failed to send OTP", error });
  }
});

// // Route to verify OTP
// app.post("/verify-otp", async (req, res) => {
//   const { phone, otp } = req.body;

//   const otpRecord = await OTP.findOne({ phone, code: otp });

//   if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });
//   if (otpRecord.expiresAt < Date.now()) return res.status(400).json({ message: "OTP expired" });

//   // Delete OTP after verification
//   await OTP.deleteMany({ phone });

//   res.status(200).json({ message: "OTP verified successfully" });
// });

//OTP









// // Get all users (Protected)
// router.get("/users", auth, async (req, res) => {
//   try {
//     const users = await User.find().select("-password"); // Exclude password from response
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// });


// // Get all users (Public - No Auth Required)
// router.get("/users", async (req, res) => {
//   try {
//     const users = await User.find().select("-password"); // Exclude passwords
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// });

router.get("/users", async (req, res) => {
  try {
    let { page, limit, name, email } = req.query;

    // Default pagination values
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Apply filters if provided
    if (name) query.name = { $regex: name, $options: "i" }; // Case-insensitive search
    if (email) query.email = email;

    // Fetch users with filters and pagination
    const users = await User.find(query).select("-password").skip(skip).limit(limit);

    // Count total users (for pagination)
    const totalUsers = await User.countDocuments(query);

    res.json({ totalUsers, page, limit, users });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});



router.put("/users/:id", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Hash new password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();
    res.json({ msg: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});





// Get single user by ID (Protected)
router.get("/users/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Update user (Protected)
// router.put("/users/:id", auth, async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     let user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     // Hash new password if provided
//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);
//     }

//     // Update fields
//     user.name = name || user.name;
//     user.email = email || user.email;

//     await user.save();
//     res.json({ msg: "User updated successfully", user });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// Update user (Public - No Auth Required)
router.put("/users/:id", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Hash new password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();
    res.json({ msg: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});


// Delete user (Protected)
router.delete("/users/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    await user.deleteOne();
    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
