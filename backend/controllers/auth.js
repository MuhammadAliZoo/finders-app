import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
  });

  if (user) {
    const token = user.getSignedJwtToken();

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isAdmin: user.isAdmin,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = user.getSignedJwtToken();

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      isAdmin: user.isAdmin,
    },
  });
});

// @desc    Login admin
// @route   POST /api/auth/admin-login
// @access  Public
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password, adminCode } = req.body;

  // Validate admin code
  if (adminCode !== process.env.ADMIN_ACCESS_CODE) {
    res.status(401);
    throw new Error('Invalid admin access code');
  }

  // Check for user
  const user = await User.findOne({ email, isAdmin: true }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid admin credentials');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid admin credentials');
  }

  const token = user.getSignedJwtToken();

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      isAdmin: user.isAdmin,
    },
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
    phone: user.phone,
    isAdmin: user.isAdmin,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.profileImage = req.body.profileImage || user.profileImage;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      phone: updatedUser.phone,
      isAdmin: updatedUser.isAdmin,
      token: updatedUser.getSignedJwtToken(),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Create test user
// @route   POST /api/auth/create-test-user
// @access  Public
export const createTestUser = asyncHandler(async (req, res) => {
  // Check if test user already exists
  const userExists = await User.findOne({ email: 'test@example.com' });

  if (userExists) {
    const token = userExists.getSignedJwtToken();
    return res.status(200).json({
      message: 'Test user already exists',
      token,
      user: {
        _id: userExists._id,
        name: userExists.name,
        email: userExists.email,
        phone: userExists.phone,
        profileImage: userExists.profileImage,
        isAdmin: userExists.isAdmin,
      },
    });
  }

  // Create test user
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    phone: '+1234567890',
    isVerified: true,
  });

  const token = user.getSignedJwtToken();

  res.status(201).json({
    message: 'Test user created successfully',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      isAdmin: user.isAdmin,
    },
  });
});
