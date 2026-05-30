const express = require("express");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const router = express.Router();
const ORDERS_FILE = path.join(__dirname, "orders.json");
const USERS_FILE = path.join(__dirname, "users.json");

// Helper to read orders
const readOrders = () => {
    if (!fs.existsSync(ORDERS_FILE)) {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
        return [];
    }
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
};

// Helper to write orders
const writeOrders = (orders) => {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
};

// In-memory store for live pending payments
let livePendingPayments = [];

// Get pending payments
router.get("/pending", (req, res) => {
    res.json(livePendingPayments);
});

// Create pending payment
router.post("/pending", (req, res) => {
    const { orderId, amount } = req.body;
    livePendingPayments.push({
        orderId,
        amount,
        status: "pending",
        date: new Date().toLocaleTimeString()
    });
    res.json({ message: "Pending payment created" });
});

// Check status of a specific pending payment
router.get("/pending/:id/status", (req, res) => {
    const payment = livePendingPayments.find(p => p.orderId === req.params.id);
    if (payment) {
        res.json({ status: payment.status });
    } else {
        res.json({ status: "not_found" });
    }
});

// Update status of pending payment (Admin)
router.put("/pending/:id", (req, res) => {
    const { status } = req.body;
    const paymentIndex = livePendingPayments.findIndex(p => p.orderId === req.params.id);
    if (paymentIndex !== -1) {
        livePendingPayments[paymentIndex].status = status;
        res.json({ message: "Status updated" });
    } else {
        res.status(404).json({ message: "Payment not found" });
    }
});

// Clear a pending payment once processed
router.delete("/pending/:id", (req, res) => {
    livePendingPayments = livePendingPayments.filter(p => p.orderId !== req.params.id);
    res.json({ message: "Cleared" });
});

// Place order
router.post("/", (req, res) => {
  const orders = readOrders();
  const newOrder = {
      ...req.body,
      id: req.body.id || `#ORD-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString()
  };
  orders.push(newOrder);
  writeOrders(orders);
  res.json({ message: "Order placed", order: newOrder });
});

// Get orders
router.get("/", (req, res) => {
  res.json(readOrders());
});

// Admin Analytics Stats
router.get("/stats", (req, res) => {
    const orders = readOrders();
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
        users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }

    // Calculate metrics
    const totalCustomers = users.filter(u => u.role === 'user').length;
    
    // Assuming each order item has a price property, or fallback to an amount property
    let totalRevenue = 0;
    orders.forEach(order => {
        // If order has an amount property (e.g. from frontend mock format)
        if (order.amount) {
            totalRevenue += parseFloat(order.amount.toString().replace('$', ''));
        } 
        // If order has items array
        else if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                totalRevenue += (parseFloat(item.price) || 0) * (item.quantity || 1);
            });
        }
    });

    const netProfit = totalRevenue * 0.35; // Mocking profit margin as 35%

    res.json({
        revenue: `$${totalRevenue.toFixed(2)}`,
        profit: `$${netProfit.toFixed(2)}`,
        customers: totalCustomers,
        activeFlights: 142 // Hardcoded for now unless flight data exists
    });
});

// Send Receipt Email
router.post("/receipt", async (req, res) => {
    const { email, name, status, items, total, reason } = req.body;
    if (!email) return res.status(400).json({ message: "No email provided" });

    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER || "your-email@gmail.com",
                pass: process.env.SMTP_PASS || "your-app-password"
            },
        });

        let subject = "";
        let htmlBody = "";

        if (status === "success") {
            subject = "Payment Successful - Smart Airline Receipt";
            const itemsList = items.map(item => `<li>${item.name} - ₹${item.price}</li>`).join("");
            htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #4ade80; text-align: center;">Payment Successful!</h2>
                    <p style="font-size: 16px; color: #333;">Hi ${name || 'Passenger'},</p>
                    <p style="font-size: 16px; color: #555;">Thank you for your purchase. Here is your receipt:</p>
                    <ul style="color: #333; font-size: 15px;">
                        ${itemsList}
                    </ul>
                    <hr/>
                    <h3 style="color: #000; text-align: right;">Total Paid: ₹${total}</h3>
                    <p style="font-size: 14px; color: #999;">Your add-ons have been confirmed for your flight.</p>
                </div>
            `;
        } else {
            subject = "Payment Failed - Smart Airline";
            htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #f87171; text-align: center;">Payment Failed</h2>
                    <p style="font-size: 16px; color: #333;">Hi ${name || 'Passenger'},</p>
                    <p style="font-size: 16px; color: #555;">Unfortunately, your recent transaction of <strong>₹${total}</strong> was declined.</p>
                    <p style="font-size: 16px; color: #333;"><strong>Reason:</strong> ${reason || "Declined by administrator."}</p>
                    <p style="font-size: 14px; color: #999;">Please try another payment method or contact support.</p>
                </div>
            `;
        }

        await transporter.sendMail({
            from: '"Smart Airline Team ✈️" <support@smartairline.com>',
            to: email,
            subject: subject,
            html: htmlBody,
        });

        res.json({ message: "Receipt sent" });
    } catch (error) {
        console.error("Receipt SMTP Error:", error.message);
        res.status(500).json({ message: "Failed to send receipt." });
    }
});

module.exports = router;