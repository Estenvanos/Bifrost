import { z } from "zod";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import generateToken from "../utils/generateToken";
import { User } from "../models/User";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  updateUserSchema,
} from "../schemas/userSchemas";

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      type: user.type,
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = registerSchema.parse(req.body);

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
    type: "customer",
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      type: user.type,
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      type: user.type,
      last_viewed_product_id: user.last_viewed_product_id,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user._id);

  if (user) {
    const updateData = updateProfileSchema.parse(req.body);

    user.username = updateData.username || user.username;
    user.email = updateData.email || user.email;
    if (updateData.password) {
      user.password = updateData.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      type: updatedUser.type,
      token: generateToken(updatedUser._id.toString()),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}).select("-password");
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await User.deleteOne({ _id: user._id });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    const updateData = updateUserSchema.parse(req.body);

    user.username = updateData.username || user.username;
    user.email = updateData.email || user.email;
    if (updateData.type) {
      user.type = updateData.type;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      type: updatedUser.type,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};
