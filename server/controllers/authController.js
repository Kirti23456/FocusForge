
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const { OAuth2Client } = require("google-auth-library");

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// const register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Validation
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     // Email already exists
//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists",
//       });
//     }

//     // Hash Password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create User
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     // Generate JWT
//     const token = jwt.sign(
//       {
//         id: user._id,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "7d",
//       }
//     );

//     res.status(201).json({
//       success: true,
//       message: "Registration Successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });

//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };
// const login = async (req, res) => {
//   try {

//     const { email, password } = req.body;

//     // Validation
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     // Check User
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Compare Password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid Credentials",
//       });
//     }

//     // Generate Token
//     const token = jwt.sign(
//       {
//         id: user._id,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "7d",
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Login Successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });

//   } catch (error) {

//     console.log(error);

//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });

//   }
// };
// const googleLogin = async (req, res) => {
//   console.log("========== GOOGLE LOGIN HIT ==========");
//   console.log(req.body);
//   try {
//     console.log("Google Login Request:", req.body);

//     const { credential } = req.body;

//     if (!credential) {
//       return res.status(400).json({
//         success: false,
//         message: "Credential missing",
//       });
//     }

//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     console.log("Google Payload:", payload);

//     const { name, email, picture } = payload;

//     let user = await User.findOne({ email });

//     if (!user) {
//       console.log("Creating new Google user...");

//       user = await User.create({
//         name,
//         email,
//         avatar: picture,
//       });

//       console.log("User Created:", user);
//     }

//     const token = jwt.sign(
//       {
//         id: user._id,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "7d",
//       }
//     );

//     return res.status(200).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//       },
//     });

//   } catch (err) {
//     console.error("Google Login Error:", err);

//     return res.status(500).json({
//       success: false,
//       message: "Google Login Failed",
//       error: err.message,
//     });
//   }
// };
// const getMe = async (req, res) => {
//   try {

//     const user = await User.findById(req.user.id).select("-password");

//     res.status(200).json({
//       success: true,
//       user,
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });

//   }
// };
// const logout = async (req, res) => {
//   try {
//     return res.status(200).json({
//       success: true,
//       message: "Logout Successful",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };

// // ================= REMOVE FRIEND =================

// const removeFriend = async (req, res) => {
//   try {
//     const { friendId } = req.params;

//     if (!friendId) {
//       return res.status(400).json({
//         success: false,
//         message: "Friend ID is required",
//       });
//     }

//     const Friendship = require("../models/Friendship");

//     const friendship = await Friendship.findOne({
//       $or: [
//         {
//           user1: req.user.id,
//           user2: friendId,
//         },
//         {
//           user1: friendId,
//           user2: req.user.id,
//         },
//       ],
//     });

//     if (!friendship) {
//       return res.status(404).json({
//         success: false,
//         message: "Friendship not found",
//       });
//     }

//     await Friendship.findByIdAndDelete(friendship._id);

//     return res.status(200).json({
//       success: true,
//       message: "Friend removed successfully",
//     });
//   } catch (error) {
//     console.error("Remove Friend Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to remove friend",
//     });
//   }
// };
// module.exports = {
//   register,
//   login,
//   googleLogin,
//   getMe,
//   logout,
//   removeFriend,
  

// };



const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =====================================================
// REGISTER
// =====================================================

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================================
// GOOGLE LOGIN
// =====================================================

const googleLogin = async (req, res) => {
  console.log("========== GOOGLE LOGIN HIT ==========");

  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Credential missing",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      name,
      email,
      picture,
    } = payload;

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    // Create Google user if not exists
    if (!user) {
      user = await User.create({
        name,
        email: normalizedEmail,
        avatar: picture || "",
        password: "",
      });
    } else {
      // Update avatar if Google provides one
      if (picture && !user.avatar) {
        user.avatar = picture;
        await user.save();
      }
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Google Login Failed",
      error: error.message,
    });
  }
};

// =====================================================
// GET CURRENT USER
// =====================================================

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================================
// LOGOUT
// =====================================================

const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================================
// REMOVE FRIEND
// =====================================================

const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    if (!friendId) {
      return res.status(400).json({
        success: false,
        message: "Friend ID is required",
      });
    }

    const Friendship = require("../models/Friendship");

    const friendship = await Friendship.findOne({
      $or: [
        {
          user1: req.user.id,
          user2: friendId,
        },
        {
          user1: friendId,
          user2: req.user.id,
        },
      ],
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Friendship not found",
      });
    }

    await Friendship.findByIdAndDelete(friendship._id);

    return res.status(200).json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (error) {
    console.error("Remove Friend Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove friend",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  logout,
  removeFriend,
};