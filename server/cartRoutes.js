const express = require("express");
const router = express.Router();

let cart = [];

// Get cart
router.get("/", (req, res) => {
  res.json(cart);
});

// Add or replace cart
router.post("/", (req, res) => {
  if (Array.isArray(req.body)) {
    cart = req.body; // replace full cart
  } else {
    cart.push(req.body); // add item
  }

  res.json({ message: "Cart updated" });
});

module.exports = router;