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

// In-memory store for pending 2-Step Verification OTP codes
// Structure: { email: { emailOtp, mobileOtp, expires } }
const pendingOtps = {};

// Helper to generate a secure random 6-digit numeric OTP code
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

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

// Server Health Check Endpoint for client settings modal ping
router.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is healthy and reachable 🚀" });
});

// Register
router.post("/register", async (req, res) => {
  const { email, password, name, phone } = req.body;
  const users = readUsers();

  const existingUser = users.find(u => u.email === email);
  if (existingUser) return res.status(400).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  
  // Grant admin role only if the email is in the authorized list
  const role = ADMIN_EMAILS.includes(email) ? "admin" : "user";

  const newUser = { email, password: hashed, name, role, phone: phone || "" };
  users.push(newUser);
  writeUsers(users);

  const token = jwt.sign({ email, role }, "secret123");
  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ message: "User registered", token, user: userWithoutPassword });
});

// Login (Enhanced with 2-Step Authentication Challenge)
router.post("/login", async (req, res) => {
  const { email, password, twoFactorEnabled } = req.body;
  const users = readUsers();

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  // If 2FA is enabled globally/request-wise (enabled by default unless explicitly disabled)
  const is2faActive = twoFactorEnabled !== false;

  if (is2faActive) {
      const emailOtp = generateOtp();
      const mobileOtp = generateOtp();
      
      // Cache the generated codes with a 5-minute expiry window
      pendingOtps[email] = {
          emailOtp,
          mobileOtp,
          expires: Date.now() + 5 * 60 * 1000
      };

      console.log(`\n======================================================`);
      console.log(`[SMS SIMULATOR] Sent OTP code to mobile: ${user.phone || "+1 *******23"}`);
      console.log(`YOUR MOBILE OTP IS: ${mobileOtp}`);
      console.log(`======================================================\n`);

      // Try to send the Email OTP via Nodemailer using configured SMTP credentials
      try {
          let transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                  user: process.env.SMTP_USER || "your-email@gmail.com",
                  pass: process.env.SMTP_PASS || "your-app-password"
              },
          });

          await transporter.sendMail({
              from: '"Smart Airline Security ✈️" <security@smartairline.com>',
              to: email,
              subject: "Your 2-Step Verification Code",
              html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #0b0710; color: #fff;">
                      <h2 style="color: #00e5ff; text-align: center;">Smart Airline Platform</h2>
                      <h3 style="color: #b388ff; text-align: center;">2-Step Verification System</h3>
                      <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;"/>
                      <p style="font-size: 16px;">Hello,</p>
                      <p style="font-size: 16px;">You are attempting to sign in to your Smart Airline account. Please enter the following 2-Step Verification OTP code on the login screen:</p>
                      
                      <div style="text-align: center; margin: 30px 0;">
                          <span style="background: rgba(0, 229, 255, 0.1); border: 2px solid #00e5ff; color: #00e5ff; padding: 15px 30px; letter-spacing: 5px; font-size: 28px; font-weight: bold; border-radius: 10px; display: inline-block; box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);">
                              ${emailOtp}
                          </span>
                      </div>
                      
                      <p style="font-size: 14px; color: #888;">This code is valid for exactly 5 minutes. If you did not initiate this login request, please change your password immediately.</p>
                  </div>
              `,
          });
      } catch (error) {
          console.error("Nodemailer 2FA Error:", error.message);
      }

      // Return status indicating that 2-Step Authentication is required to complete the login
      return res.json({ 
          twoFactorRequired: true, 
          email: user.email, 
          mobileNumber: user.phone || "+1 *******23",
          // Send mobileOtp back to support browser-based SMS toast popup overlay simulator
          simulatedMobileOtp: mobileOtp
      });
  }

  // Fallback: If 2FA is explicitly disabled, proceed with normal token delivery
  const token = jwt.sign({ email, role: user.role }, "secret123");
  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

// Verify 2-Step Authentication OTP Codes
router.post("/verify-2fa", async (req, res) => {
    const { email, emailOtp, mobileOtp } = req.body;
    
    if (!email || !emailOtp || !mobileOtp) {
        return res.status(400).json({ message: "Verification codes are required" });
    }

    const pending = pendingOtps[email];
    if (!pending) {
        return res.status(400).json({ message: "OTP session expired or not found. Please log in again." });
    }

    if (Date.now() > pending.expires) {
        delete pendingOtps[email];
        return res.status(400).json({ message: "OTP expired. Please log in again." });
    }

    // Verify both codes
    if (pending.emailOtp !== emailOtp.trim()) {
        return res.status(400).json({ message: "Incorrect Email verification code." });
    }

    if (pending.mobileOtp !== mobileOtp.trim()) {
        return res.status(400).json({ message: "Incorrect Mobile SMS verification code." });
    }

    // Clear verification cache on success
    delete pendingOtps[email];

    // Issue standard authorization token
    const users = readUsers();
    const user = users.find(u => u.email === email);
    const token = jwt.sign({ email, role: user.role }, "secret123");
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
});

// Forgot Password (Enhanced with Dynamic Origin and Optional Reset 2FA OTP)
router.post("/forgot-password", async (req, res) => {
    const { email, clientOrigin } = req.body;
    
    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: "User not found" });

    // Fallback to standard localhost if not supplied by the frontend
    const origin = clientOrigin || "http://localhost:5173";
    const resetUrl = `${origin}/reset-password?email=${encodeURIComponent(email)}`;
    
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER || "your-email@gmail.com", 
                pass: process.env.SMTP_PASS || "your-app-password" 
            },
        });

        await transporter.sendMail({
            from: '"Smart Airline Team ✈️" <support@smartairline.com>',
            to: email, 
            subject: "Password Reset Request",
            text: `Hello! Click the link to reset your password: ${resetUrl}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #0b0710; color: #fff;">
                    <h2 style="color: #00e5ff; text-align: center;">Smart Airline Support</h2>
                    <p style="font-size: 16px; color: #eee;">Hello,</p>
                    <p style="font-size: 16px; color: #ccc;">We received a request to reset the password for your account. You can reset your password by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background: #00e5ff; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset My Password</a>
                    </div>
                    <p style="font-size: 14px; color: #888;">If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
            `,
        });

        res.json({ message: "Real email sent successfully" });
    } catch (error) {
        console.error("SMTP Error:", error.message);
        res.status(500).json({ message: "Failed to send real email. Please check credentials in server/.env" });
    }
});

// Request 2-Step Verification for Password Reset Screen
router.post("/forgot-password/request-otp", async (req, res) => {
    const { email } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const emailOtp = generateOtp();
    const mobileOtp = generateOtp();

    pendingOtps[`reset_${email}`] = {
        emailOtp,
        mobileOtp,
        expires: Date.now() + 5 * 60 * 1000
    };

    console.log(`\n======================================================`);
    console.log(`[SMS SIMULATOR] Sent Reset Password OTP to mobile: ${user.phone || "+1 *******23"}`);
    console.log(`YOUR MOBILE RESET OTP IS: ${mobileOtp}`);
    console.log(`======================================================\n`);

    // Send Email
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER || "your-email@gmail.com",
                pass: process.env.SMTP_PASS || "your-app-password"
            },
        });

        await transporter.sendMail({
            from: '"Smart Airline Security ✈️" <security@smartairline.com>',
            to: email,
            subject: "Your Password Reset Verification Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #0b0710; color: #fff;">
                    <h2 style="color: #ff416c; text-align: center;">Password Reset Verification</h2>
                    <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;"/>
                    <p style="font-size: 16px;">Hello,</p>
                    <p style="font-size: 16px;">Please use the following 6-digit OTP code to verify your identity before entering a new password:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="background: rgba(255, 65, 108, 0.1); border: 2px solid #ff416c; color: #ff416c; padding: 15px 30px; letter-spacing: 5px; font-size: 28px; font-weight: bold; border-radius: 10px; display: inline-block;">
                            ${emailOtp}
                        </span>
                    </div>
                    
                    <p style="font-size: 14px; color: #888;">This code is valid for exactly 5 minutes. If you did not initiate this request, contact support.</p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Nodemailer Reset 2FA Error:", error.message);
    }

    res.json({
        message: "OTPs dispatched successfully",
        email: user.email,
        mobileNumber: user.phone || "+1 *******23",
        simulatedMobileOtp: mobileOtp
    });
});

// Verify 2-Step OTPs for Password Reset Screen
router.post("/forgot-password/verify-otp", async (req, res) => {
    const { email, emailOtp, mobileOtp } = req.body;
    const sessionKey = `reset_${email}`;

    const pending = pendingOtps[sessionKey];
    if (!pending) {
        return res.status(400).json({ message: "Verification session not found or expired." });
    }

    if (Date.now() > pending.expires) {
        delete pendingOtps[sessionKey];
        return res.status(400).json({ message: "Verification codes expired. Please try again." });
    }

    if (pending.emailOtp !== emailOtp.trim()) {
        return res.status(400).json({ message: "Incorrect Email code." });
    }

    if (pending.mobileOtp !== mobileOtp.trim()) {
        return res.status(400).json({ message: "Incorrect Mobile SMS code." });
    }

    // Success: Mark this session verified by saving a brief token
    pendingOtps[sessionKey].verified = true;
    pendingOtps[sessionKey].expires = Date.now() + 2 * 60 * 1000; // Allow 2 minutes to complete password submission

    res.json({ message: "Verification successful. You can now change your password." });
});

// Reset Password (Update users.json with 2FA check verification)
router.post("/reset-password", async (req, res) => {
    const { email, password, bypass2fa } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const sessionKey = `reset_${email}`;
    const pending = pendingOtps[sessionKey];

    // If 2FA is active, require verification session to exist and be marked verified
    if (bypass2fa !== true) {
        if (!pending || !pending.verified) {
            return res.status(400).json({ message: "Identity verification is required before resetting password." });
        }
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

    // Clear verification session on completion
    delete pendingOtps[sessionKey];

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
    res.json({ message: "Profile updated successfully", user: updatedUser });
});

module.exports = router;