const express = require("express");
const authMiddleware = require("./authMiddleware");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const BUNDLES_FILE = path.join(__dirname, "bundles.json");

const defaultBundles = [
  {
    id: 1,
    name: 'XTRA PACK',
    price: 700,
    iconBg: '#f59e0b',
    shuuPassPrice: 600,
    description: '(Domestic & International)',
    features: [
      { text: 'Any standard seat of your choice' },
      { text: "A choice of 'Gourmair' Hot Meals from our delectable dining menu or a Lite Bite (herb roast vegetable roll or chicken junglee sandwich)" }
    ]
  },
  {
    id: 2,
    name: 'XPERIENCE PACK',
    price: 1000,
    iconBg: '#f87171',
    shuuPassPrice: 900,
    description: '(Domestic)',
    internationalPrice: 1200,
    internationalShuuPassPrice: 1000,
    features: [
      { text: '50% off Prime seats or any standard seat of your choice' },
      { text: "A choice of 'Gourmair' Hot Meals from our delectable dining menu or a Lite Bite (herb roast vegetable roll or chicken junglee sandwich)" },
      { text: "Xpress Ahead priority check-in, boarding and baggage delivery" }
    ]
  }
];

const readBundles = () => {
  if (!fs.existsSync(BUNDLES_FILE)) {
    fs.writeFileSync(BUNDLES_FILE, JSON.stringify(defaultBundles, null, 2));
    return defaultBundles;
  }
  return JSON.parse(fs.readFileSync(BUNDLES_FILE, "utf-8"));
};

const writeBundles = (bundles) => {
  fs.writeFileSync(BUNDLES_FILE, JSON.stringify(bundles, null, 2));
};

router.get("/", (req, res) => {
  res.json(readBundles());
});

router.post("/", authMiddleware, (req, res) => {
  const bundles = readBundles();
  const newBundle = {
    id: bundles.length > 0 ? Math.max(...bundles.map(b => b.id)) + 1 : 1,
    ...req.body
  };
  bundles.push(newBundle);
  writeBundles(bundles);
  res.json({ message: "Bundle added", bundle: newBundle });
});

router.put("/:id", authMiddleware, (req, res) => {
  const bundles = readBundles();
  const bundleId = parseInt(req.params.id);
  const index = bundles.findIndex(b => b.id === bundleId);
  
  if (index !== -1) {
    bundles[index] = { ...bundles[index], ...req.body, id: bundleId };
    writeBundles(bundles);
    res.json({ message: "Bundle updated", bundle: bundles[index] });
  } else {
    res.status(404).json({ message: "Bundle not found" });
  }
});

router.delete("/:id", authMiddleware, (req, res) => {
  let bundles = readBundles();
  const bundleId = parseInt(req.params.id);
  bundles = bundles.filter(b => b.id !== bundleId);
  writeBundles(bundles);
  res.json({ message: "Bundle deleted" });
});

module.exports = router;
