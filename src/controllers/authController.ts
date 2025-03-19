import { Request, Response, RequestHandler } from "express";
import argon2 from "argon2";
import prisma from "../database/db.config";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
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
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const user = await prisma.user.create({
      data: {
        name: username,
        password: hashedPassword,
        email,
        verificationToken: verificationToken,
        refreshToken: "", 
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `
        <h1>Hi ${username},</h1>
        <h2>Verify Your Email</h2>
        <p>
          Click the link below to verify your email address:
          <a href="${verificationLink}" target="_blank" rel="noopener noreferrer">${verificationLink}</a>
        </p>
      `,
    };
    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    const decodedToken = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    if(!decodedToken.email){
      res.status(400).json({ message: "Invalid token" });
      return;
    }
    const { email } = decodedToken;
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        isVerified: true,
      },
    });
    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
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
    if(!user.isVerified){
      res.status(404).json({ message: "User is not verified" });
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

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const userId = ((req as JwtPayload) || String).data?.id;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
      },
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
