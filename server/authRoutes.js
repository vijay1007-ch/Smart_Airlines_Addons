require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const USERS_FILE = path.join(__dirname, "users.json");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

const ADMIN_EMAILS = [
    "bikkinavijay0@gmail.com",
    "admin2@gmail.com",
];

const pendingOtps = {};
const pendingRegistrations = {};

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) {
        const defaultUsers = ADMIN_EMAILS.map((email, index) => ({
            email,
            password: bcrypt.hashSync("123456", 10),
            role: "admin",
            name: `Admin ${index + 1}`,
            phone: "",
        }));

        fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
        return defaultUsers;
    }

    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
};

const writeUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

const sendEmail = async ({ to, subject, html, from }) => {
    return await resend.emails.send({
        from: from || "Smart Airline Security <onboarding@resend.dev>",
        to,
        subject,
        html,
    });
};

router.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is healthy and reachable 🚀" });
});

router.post("/register", async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        const users = readUsers();

        if (!email || !password || !name) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const emailOtp = generateOtp();
        const mobileOtp = generateOtp();

        pendingRegistrations[normalizedEmail] = {
            email: normalizedEmail,
            password,
            name,
            phone: phone || "",
            emailOtp,
            mobileOtp,
            expires: Date.now() + 5 * 60 * 1000,
        };

        await sendEmail({
            to: normalizedEmail,
            subject: "Your Registration Verification Code",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #0b0710; color: #fff;">
          <h2 style="color: #00e5ff; text-align: center;">Smart Airline Platform</h2>
          <h3 style="color: #7cf29a; text-align: center;">Registration Verification</h3>
          <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;"/>
          <p style="font-size: 16px;">Hello ${name},</p>
          <p style="font-size: 16px;">Use the following Email OTP to continue your registration:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background: rgba(124, 242, 154, 0.1); border: 2px solid #7cf29a; color: #7cf29a; padding: 15px 30px; letter-spacing: 5px; font-size: 28px; font-weight: bold; border-radius: 10px; display: inline-block;">
              ${emailOtp}
            </span>
          </div>
          <p style="font-size: 14px; color: #888;">This code is valid for 5 minutes.</p>
        </div>
      `,
        });

        console.log(`\n======================================================`);
        console.log(`[SMS SIMULATOR] Sent Registration OTP to mobile: ${phone || "+1 *******23"}`);
        console.log(`REGISTRATION MOBILE OTP: ${mobileOtp}`);
        console.log(`======================================================\n`);

        return res.json({
            verificationRequired: true,
            email: normalizedEmail,
            mobileNumber: phone || "+1 *******23",
            message: "Email OTP sent successfully and mobile OTP generated.",
        });
    } catch (error) {
        console.error("Registration email error:", error);
        return res.status(500).json({ message: "Failed to send registration verification email." });
    }
});

router.post("/register/verify", async (req, res) => {
    try {
        const { email, emailOtp, mobileOtp } = req.body;

        if (!email || !emailOtp || !mobileOtp) {
            return res.status(400).json({ message: "Email OTP and Mobile OTP are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const pending = pendingRegistrations[normalizedEmail];

        if (!pending) {
            return res.status(400).json({ message: "Registration session expired or not found. Please sign up again." });
        }

        if (Date.now() > pending.expires) {
            delete pendingRegistrations[normalizedEmail];
            return res.status(400).json({ message: "OTP expired. Please sign up again." });
        }

        if (pending.emailOtp !== emailOtp.trim()) {
            return res.status(400).json({ message: "Incorrect Email verification code." });
        }

        if (pending.mobileOtp !== mobileOtp.trim()) {
            return res.status(400).json({ message: "Incorrect Mobile SMS verification code." });
        }

        const users = readUsers();
        const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (existingUser) {
            delete pendingRegistrations[normalizedEmail];
            return res.status(400).json({ message: "User already exists" });
        }

        const hashed = await bcrypt.hash(pending.password, 10);
        const role = ADMIN_EMAILS.includes(normalizedEmail) ? "admin" : "user";

        const newUser = {
            email: normalizedEmail,
            password: hashed,
            name: pending.name,
            role,
            phone: pending.phone,
        };

        users.push(newUser);
        writeUsers(users);
        delete pendingRegistrations[normalizedEmail];

        const token = jwt.sign({ email: normalizedEmail, role }, JWT_SECRET, { expiresIn: "1d" });
        const { password: _, ...userWithoutPassword } = newUser;

        return res.json({
            message: "User registered successfully",
            token,
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Register verify error:", error);
        return res.status(500).json({ message: "Registration verification failed." });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password, twoFactorEnabled } = req.body;
        const users = readUsers();

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Wrong password" });
        }

        const is2faActive = twoFactorEnabled !== false;

        if (is2faActive) {
            const emailOtp = generateOtp();

            pendingOtps[normalizedEmail] = {
                emailOtp,
                expires: Date.now() + 5 * 60 * 1000,
            };

            await sendEmail({
                to: normalizedEmail,
                subject: "Your 2-Step Verification Code",
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #0b0710; color: #fff;">
            <h2 style="color: #00e5ff; text-align: center;">Smart Airline Platform</h2>
            <h3 style="color: #b388ff; text-align: center;">2-Step Verification System</h3>
            <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;"/>
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 16px;">Use the following OTP to complete login:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="background: rgba(0, 229, 255, 0.1); border: 2px solid #00e5ff; color: #00e5ff; padding: 15px 30px; letter-spacing: 5px; font-size: 28px; font-weight: bold; border-radius: 10px; display: inline-block;">
                ${emailOtp}
              </span>
            </div>
            <p style="font-size: 14px; color: #888;">This code is valid for 5 minutes.</p>
          </div>
        `,
            });

            return res.json({
                twoFactorRequired: true,
                email: normalizedEmail,
            });
        }

        const token = jwt.sign({ email: normalizedEmail, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
        const { password: _, ...userWithoutPassword } = user;

        return res.json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error("Resend 2FA Error:", error);
        return res.status(500).json({ message: "Failed to send OTP email. Please try again." });
    }
});

router.post("/verify-2fa", async (req, res) => {
    try {
        const { email, emailOtp } = req.body;

        if (!email || !emailOtp) {
            return res.status(400).json({ message: "Verification code is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const pending = pendingOtps[normalizedEmail];

        if (!pending) {
            return res.status(400).json({ message: "OTP session expired or not found. Please log in again." });
        }

        if (Date.now() > pending.expires) {
            delete pendingOtps[normalizedEmail];
            return res.status(400).json({ message: "OTP expired. Please log in again." });
        }

        if (pending.emailOtp !== emailOtp.trim()) {
            return res.status(400).json({ message: "Incorrect Email verification code." });
        }

        delete pendingOtps[normalizedEmail];

        const users = readUsers();
        const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = jwt.sign({ email: normalizedEmail, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
        const { password: _, ...userWithoutPassword } = user;

        return res.json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error("Verify 2FA error:", error);
        return res.status(500).json({ message: "2FA verification failed." });
    }
});

router.post("/forgot-password", async (req, res) => {
    try {
        const { email, clientOrigin } = req.body;
        const users = readUsers();

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const origin = clientOrigin || "http://localhost:5173";
        const resetUrl = `${origin}/reset-password?email=${encodeURIComponent(normalizedEmail)}`;

        await sendEmail({
            to: normalizedEmail,
            from: "Smart Airline Support <onboarding@resend.dev>",
            subject: "Password Reset Request",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #0b0710; color: #fff;">
          <h2 style="color: #00e5ff; text-align: center;">Smart Airline Support</h2>
          <p style="font-size: 16px; color: #eee;">Hello,</p>
          <p style="font-size: 16px; color: #ccc;">We received a request to reset your password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #00e5ff; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset My Password</a>
          </div>
          <p style="font-size: 14px; color: #888;">If you did not request this, ignore this email.</p>
        </div>
      `,
        });

        return res.json({ message: "Reset email sent successfully" });
    } catch (error) {
        console.error("Resend Forgot Password Error:", error);
        return res.status(500).json({ message: "Failed to send reset email." });
    }
});

router.post("/forgot-password/request-otp", async (req, res) => {
    try {
        const { email } = req.body;
        const users = readUsers();

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const emailOtp = generateOtp();

        pendingOtps[`reset_${normalizedEmail}`] = {
            emailOtp,
            expires: Date.now() + 5 * 60 * 1000,
        };

        await sendEmail({
            to: normalizedEmail,
            subject: "Your Password Reset Verification Code",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #0b0710; color: #fff;">
          <h2 style="color: #ff416c; text-align: center;">Password Reset Verification</h2>
          <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;"/>
          <p style="font-size: 16px;">Hello,</p>
          <p style="font-size: 16px;">Use the following OTP to verify your identity before changing your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background: rgba(255, 65, 108, 0.1); border: 2px solid #ff416c; color: #ff416c; padding: 15px 30px; letter-spacing: 5px; font-size: 28px; font-weight: bold; border-radius: 10px; display: inline-block;">
              ${emailOtp}
            </span>
          </div>
          <p style="font-size: 14px; color: #888;">This code is valid for 5 minutes.</p>
        </div>
      `,
        });

        return res.json({
            message: "OTP dispatched successfully",
            email: normalizedEmail,
        });
    } catch (error) {
        console.error("Resend Reset 2FA Error:", error);
        return res.status(500).json({ message: "Failed to send reset OTP email." });
    }
});

router.post("/forgot-password/verify-otp", async (req, res) => {
    try {
        const { email, emailOtp } = req.body;

        if (!email || !emailOtp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const sessionKey = `reset_${normalizedEmail}`;
        const pending = pendingOtps[sessionKey];

        if (!pending) {
            return res.status(400).json({ message: "Verification session not found or expired." });
        }

        if (Date.now() > pending.expires) {
            delete pendingOtps[sessionKey];
            return res.status(400).json({ message: "Verification code expired. Please try again." });
        }

        if (pending.emailOtp !== emailOtp.trim()) {
            return res.status(400).json({ message: "Incorrect Email code." });
        }

        pendingOtps[sessionKey].verified = true;
        pendingOtps[sessionKey].expires = Date.now() + 2 * 60 * 1000;

        return res.json({ message: "Verification successful. You can now change your password." });
    } catch (error) {
        console.error("Forgot password verify OTP error:", error);
        return res.status(500).json({ message: "Verification failed." });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const { email, password, bypass2fa } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const sessionKey = `reset_${normalizedEmail}`;
        const pending = pendingOtps[sessionKey];

        if (bypass2fa !== true) {
            if (!pending || !pending.verified) {
                return res.status(400).json({ message: "Identity verification is required before resetting password." });
            }
        }

        const users = readUsers();
        const userIndex = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);

        if (userIndex === -1) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashed = await bcrypt.hash(password, 10);
        users[userIndex].password = hashed;

        writeUsers(users);
        delete pendingOtps[sessionKey];

        return res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ message: "Failed to reset password." });
    }
});

router.put("/profile", (req, res) => {
    try {
        const { email, phone, age, dob, passport, hasShuuPass, shuuPassDate } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required to update profile" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const users = readUsers();
        const userIndex = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);

        if (userIndex === -1) {
            return res.status(404).json({ message: "User not found" });
        }

        users[userIndex] = {
            ...users[userIndex],
            phone: phone !== undefined ? phone : users[userIndex].phone || "",
            age: age !== undefined ? age : users[userIndex].age || "",
            dob: dob !== undefined ? dob : users[userIndex].dob || "",
            passport: passport !== undefined ? passport : users[userIndex].passport || "",
            hasShuuPass: hasShuuPass !== undefined ? hasShuuPass : users[userIndex].hasShuuPass || false,
            shuuPassDate: shuuPassDate !== undefined ? shuuPassDate : users[userIndex].shuuPassDate || null,
        };

        writeUsers(users);

        const { password: _, ...safeUser } = users[userIndex];
        return res.json({ message: "Profile updated successfully", user: safeUser });
    } catch (error) {
        console.error("Profile update error:", error);
        return res.status(500).json({ message: "Failed to update profile" });
    }
});

router.get("/users", (req, res) => {
    try {
        const users = readUsers();
        const safeUsers = users.map(({ password, ...user }) => user);
        return res.json(safeUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "Failed to fetch users" });
    }
});

module.exports = router;