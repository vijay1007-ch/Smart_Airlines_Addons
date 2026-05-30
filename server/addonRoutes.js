const express = require("express");
const authMiddleware = require("./authMiddleware");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const ADDONS_FILE = path.join(__dirname, "addons.json");

// Helper to read addons
const readAddons = () => {
  if (!fs.existsSync(ADDONS_FILE)) {
    const defaultAddons = [];
    fs.writeFileSync(ADDONS_FILE, JSON.stringify(defaultAddons, null, 2));
    return defaultAddons;
  }
  return JSON.parse(fs.readFileSync(ADDONS_FILE, "utf-8"));
};

// Helper to write addons
const writeAddons = (addons) => {
  fs.writeFileSync(ADDONS_FILE, JSON.stringify(addons, null, 2));
};

// Get all addons
router.get("/", (req, res) => {
  const addons = readAddons();
  res.json(addons);
});

// Add new addon (protected)
router.post("/", authMiddleware, (req, res) => {
  const addons = readAddons();
  const newAddon = {
    id: addons.length > 0 ? Math.max(...addons.map(a => a.id)) + 1 : 1,
    name: req.body.name,
    price: Number(req.body.price)
  };
  addons.push(newAddon);
  writeAddons(addons);
  res.json({ message: "Addon added", addon: newAddon });
});

// Update addon
router.put("/:id", authMiddleware, (req, res) => {
  const addons = readAddons();
  const addonId = parseInt(req.params.id);
  const addonIndex = addons.findIndex(a => a.id === addonId);
  
  if (addonIndex !== -1) {
    if (req.body.name) addons[addonIndex].name = req.body.name;
    if (req.body.price) addons[addonIndex].price = Number(req.body.price);
    writeAddons(addons);
    res.json({ message: "Addon updated", addon: addons[addonIndex] });
  } else {
    res.status(404).json({ message: "Addon not found" });
  }
});

// Delete addon
router.delete("/:id", authMiddleware, (req, res) => {
  let addons = readAddons();
  const addonId = parseInt(req.params.id);
  addons = addons.filter(a => a.id !== addonId);
  writeAddons(addons);
  res.json({ message: "Addon deleted" });
});

module.exports = router;