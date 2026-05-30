require('dotenv').config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const router = express.Router();
const USERS_FILE = path.join(__dirname, "users.json");

// Define the strict list of authorized admin emails
const ADMIN_EMAILS = [
    "bikkinavijay0@gmail.com",
    "admin2@gmail.com" 
];

// Helper to read users
const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) {
        // Automatically seed the two admins if the database is empty
        const defaultUsers = ADMIN_EMAILS.map((email, index) => ({
            email: email,
            password: bcrypt.hashSync("123456", 10), // Default password, they should change this
            role: "admin",
            name: `Admin ${index + 1}`
        }));
        
        fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
        return defaultUsers;
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
};

// Helper to write users
const writeUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Register
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  const users = readUsers();

  const existingUser = users.find(u => u.email === email);
  if (existingUser) return res.status(400).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  
  // Grant admin role only if the email is in the authorized list
  const role = ADMIN_EMAILS.includes(email) ? "admin" : "user";

  const newUser = { email, password: hashed, name, role };
  users.push(newUser);
  writeUsers(users);

  const token = jwt.sign({ email, role }, "secret123");
  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ message: "User registered", token, user: userWithoutPassword });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign({ email, role: user.role }, "secret123");

  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    
    // To send REAL emails, we need a real SMTP server. 
    // Here is a standard configuration that works with Gmail (or any SMTP provider).
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail', // You can change this to 'outlook', 'yahoo', etc.
            auth: {
                user: process.env.SMTP_USER || "your-email@gmail.com", 
                pass: process.env.SMTP_PASS || "your-app-password" 
            },
        });

        await transporter.sendMail({
            from: '"Smart Airline Team ✈️" <support@smartairline.com>',
            to: email, // This will send to the REAL email entered by the user
            subject: "Password Reset Request",
            text: `Hello! Click the link to reset your password: http://localhost:5173/reset-password?email=${encodeURIComponent(email)}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #00e5ff; text-align: center;">Smart Airline Support</h2>
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #555;">We received a request to reset the password for your account. You can reset your password by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/reset-password?email=${encodeURIComponent(email)}" style="background: #00e5ff; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset My Password</a>
                    </div>
                    <p style="font-size: 14px; color: #999;">If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
            `,
        });

        res.json({ message: "Real email sent successfully" });
    } catch (error) {
        console.error("SMTP Error:", error.message);
        res.status(500).json({ message: "Failed to send real email. Please add your Gmail credentials to server/.env" });
    }
});

// Reset Password (Update users.json)
router.post("/reset-password", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const users = readUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
        return res.status(404).json({ message: "User not found" });
    }

    // Hash new password and update
    const hashed = await bcrypt.hash(password, 10);
    users[userIndex].password = hashed;
    
    writeUsers(users);
    res.json({ message: "Password updated successfully" });
});
// Update Profile
router.put("/profile", (req, res) => {
    const { email, phone, age, dob, passport, hasShuuPass, shuuPassDate } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Email is required to update profile" });
    }

    const users = readUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
        return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    users[userIndex] = {
        ...users[userIndex],
        phone: phone !== undefined ? phone : (users[userIndex].phone || ""),
        age: age !== undefined ? age : (users[userIndex].age || ""),
        dob: dob !== undefined ? dob : (users[userIndex].dob || ""),
        passport: passport !== undefined ? passport : (users[userIndex].passport || ""),
        hasShuuPass: hasShuuPass !== undefined ? hasShuuPass : (users[userIndex].hasShuuPass || false),
        shuuPassDate: shuuPassDate !== undefined ? shuuPassDate : (users[userIndex].shuuPassDate || null)
    };
    
    writeUsers(users);
    
    // Return updated user without password
    const { password: _, ...updatedUser } = users[userIndex];
    res.json({ message: "Profile updated successfully", user: updatedUser });
});

module.exports = router;