import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  res
    .status(201)
    .json(
      new ApiResponse("Account created successfully", {
        token,
        user: user.toSafeObject(),
      })
    );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password"
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken(user._id);

  res.status(200).json(
    new ApiResponse("Logged in successfully", {
      token,
      user: user.toSafeObject(),
    })
  );
});

export const getMe = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse("Current user fetched", { user: req.user.toSafeObject() }));
});
