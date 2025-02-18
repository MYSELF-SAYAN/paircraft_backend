import { Request, Response, RequestHandler } from "express";
import argon2 from "argon2";
import prisma from "../database/db.config";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const hashedPassword = await argon2.hash(password);
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = await prisma.user.create({
      data: {
        name: username,
        password: hashedPassword,
        email,
        refreshToken: "",
      },
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};
export const loginUser: RequestHandler = async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(404).json({ message: "Please provide email and password" });
  }
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }
    const { password: _, ...userWithoutPassword } = user;
    const signData = {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      name: userWithoutPassword.name,
    };
    const token = jwt.sign(signData, process.env.JWT_SECRET as string, {
      expiresIn: "30d",
    });
    res
      .status(200)
      .json({ message: "User logged in successfully", token: token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
