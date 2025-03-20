const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc Register User
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// // @desc Update User
// exports.updateUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId);

//     if (user) {
//       user.name = req.body.name || user.name;
//       if (req.body.password) {
//         user.password = req.body.password;
//       }

//       const updatedUser = await user.save();
//       res.json(updatedUser);
//     } else {
//       res.status(404).json({ message: "User not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };







// router.put("/users/:id", async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     console.log("Incoming request to update user:", req.params.id, req.body);

//     let user = await User.findById(req.params.id);
//     if (!user) {
//       console.log("User not found:", req.params.id);
//       return res.status(404).json({ msg: "User not found" });
//     }

//     // Hash new password if provided
//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);
//     }

//     // Update fields
//     user.name = name || user.name;
//     user.email = email || user.email;

//     await user.save();
//     console.log("User updated successfully:", user);

//     res.json({ msg: "User updated successfully", user });
//   } catch (err) {
//     console.error("Error updating user:", err.message); // Prints the actual error
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// });






router.put("/users/:id", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: "Invalid user ID format" });
    }

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();
    res.json({ msg: "User updated successfully", user });

  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});











// @desc Delete User
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

