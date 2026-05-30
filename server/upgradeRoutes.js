const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const UPGRADES_FILE = path.join(__dirname, "upgrades.json");

const readUpgrades = () => {
    if (!fs.existsSync(UPGRADES_FILE)) {
        fs.writeFileSync(UPGRADES_FILE, JSON.stringify([], null, 2));
        return [];
    }
    return JSON.parse(fs.readFileSync(UPGRADES_FILE, "utf-8"));
};

const writeUpgrades = (upgrades) => {
    fs.writeFileSync(UPGRADES_FILE, JSON.stringify(upgrades, null, 2));
};

// POST /upgrades - User requests an upgrade
router.post("/", (req, res) => {
    const { email, customerName, currentSeat, requestedClass } = req.body;
    const upgrades = readUpgrades();
    
    // Check if user already has a pending request
    const existing = upgrades.find(u => u.email === email && u.status === 'Pending');
    if (existing) {
        return res.status(400).json({ message: "You already have a pending upgrade request." });
    }

    const newUpgrade = {
        id: `UPG-${Math.floor(Math.random() * 10000)}`,
        email,
        customerName,
        currentSeat,
        requestedClass,
        status: "Pending", // Pending, Approved, Rejected
        date: new Date().toISOString()
    };
    
    upgrades.push(newUpgrade);
    writeUpgrades(upgrades);
    res.json({ message: "Upgrade request submitted", upgrade: newUpgrade });
});

// GET /upgrades - Admin gets all requests
router.get("/", (req, res) => {
    res.json(readUpgrades());
});

// GET /upgrades/user/:email - User gets their requests
router.get("/user/:email", (req, res) => {
    const upgrades = readUpgrades();
    const userUpgrades = upgrades.filter(u => u.email === req.params.email);
    res.json(userUpgrades);
});

// PUT /upgrades/:id/offer - Admin assigns seat and price
router.put("/:id/offer", (req, res) => {
    const { newSeat, price } = req.body;
    const upgrades = readUpgrades();
    const index = upgrades.findIndex(u => u.id === req.params.id);
    
    if (index === -1) return res.status(404).json({ message: "Request not found" });
    
    upgrades[index].status = "Pending Payment";
    upgrades[index].newSeat = newSeat;
    upgrades[index].price = price;
    
    writeUpgrades(upgrades);
    res.json({ message: `Upgrade offered`, upgrade: upgrades[index] });
});

// PUT /upgrades/:id/approve - User completes payment
router.put("/:id/approve", (req, res) => {
    const upgrades = readUpgrades();
    const index = upgrades.findIndex(u => u.id === req.params.id);
    
    if (index === -1) return res.status(404).json({ message: "Request not found" });
    
    upgrades[index].status = "Approved";
    
    writeUpgrades(upgrades);
    res.json({ message: `Upgrade approved`, upgrade: upgrades[index] });
});

// PUT /upgrades/:id/reject - Admin rejects
router.put("/:id/reject", (req, res) => {
    const upgrades = readUpgrades();
    const index = upgrades.findIndex(u => u.id === req.params.id);
    
    if (index === -1) return res.status(404).json({ message: "Request not found" });
    
    upgrades[index].status = "Rejected";
    
    writeUpgrades(upgrades);
    res.json({ message: `Upgrade rejected`, upgrade: upgrades[index] });
});

module.exports = router;
