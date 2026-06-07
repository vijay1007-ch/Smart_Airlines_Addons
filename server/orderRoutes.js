const express = require("express");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

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
    const { email, name, status, items, total, reason, paymentMethod } = req.body;
    if (!email) return res.status(400).json({ message: "No email provided" });

    try {
        let subject = "";
        let htmlBody = "";

        if (status === "success") {
            subject = "Payment Successful - Smart Airline Receipt";
            const itemsList = items.map(item => `<li style="margin-bottom: 5px;"><strong>${item.name}</strong> - ₹${item.price}</li>`).join("");
            htmlBody = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
                        <h2 style="color: #10b981; margin: 0;">Payment Successful!</h2>
                    </div>
                    <p style="font-size: 16px; color: #334155; margin-bottom: 20px;">Hi <strong>${name || 'Passenger'}</strong>,</p>
                    <p style="font-size: 16px; color: #475569; margin-bottom: 15px;">Thank you for your purchase. Your transaction was successful. Here are your purchase details:</p>
                    
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <ul style="color: #334155; font-size: 15px; list-style-type: none; padding-left: 0; margin: 0;">
                            ${itemsList}
                        </ul>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Payment Method:</td>
                            <td style="padding: 8px 0; color: #0f172a; text-align: right; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${paymentMethod || 'Credit/Debit Card'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #0f172a; font-weight: bold; font-size: 18px;">Total Paid:</td>
                            <td style="padding: 12px 0; color: #10b981; text-align: right; font-weight: bold; font-size: 18px;">₹${total}</td>
                        </tr>
                    </table>

                    <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-top: 30px;">Your add-ons have been confirmed for your flight. Have a great journey!</p>
                </div>
            `;
        } else {
            subject = "Payment Failed - Smart Airline";
            htmlBody = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 40px; margin-bottom: 10px;">❌</div>
                        <h2 style="color: #ef4444; margin: 0;">Payment Failed</h2>
                    </div>
                    <p style="font-size: 16px; color: #334155; margin-bottom: 20px;">Hi <strong>${name || 'Passenger'}</strong>,</p>
                    <p style="font-size: 16px; color: #475569; margin-bottom: 15px;">Unfortunately, your recent transaction of <strong style="color: #ef4444;">₹${total}</strong> was declined.</p>
                    
                    <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="font-size: 15px; color: #991b1b; margin: 0;"><strong>Reason:</strong> ${reason || "Declined by administrator."}</p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Attempted Method:</td>
                            <td style="padding: 8px 0; color: #0f172a; text-align: right; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${paymentMethod || 'Credit/Debit Card'}</td>
                        </tr>
                    </table>

                    <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 30px;">Please try another payment method or contact support if you need assistance.</p>
                </div>
            `;
        }

        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = "bikkinavijay0@gmail.com"; 

        const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": apiKey,
            },
            body: JSON.stringify({
                sender: { email: senderEmail, name: "Smart Airline" },
                to: [{ email: email }],
                subject: subject,
                htmlContent: htmlBody,
            }),
        });

        if (!brevoRes.ok) {
            const errText = await brevoRes.text();
            console.error("Brevo receipt email error:", brevoRes.status, errText);
            throw new Error(`Brevo send failed with status ${brevoRes.status}`);
        }

        res.json({ message: "Receipt sent" });
    } catch (error) {
        console.error("Receipt Brevo Error:", error.message);
        res.status(500).json({ message: "Failed to send receipt." });
    }
});

module.exports = router;