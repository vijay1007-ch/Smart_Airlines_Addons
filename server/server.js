const express = require("express");
const cors = require("cors");

const authRoutes = require("./authRoutes");
const addonRoutes = require("./addonRoutes");
const cartRoutes = require("./cartRoutes");
const orderRoutes = require("./orderRoutes");
const upgradeRoutes = require("./upgradeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/addons", addonRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/upgrades", upgradeRoutes);
app.use("/bundles", require("./bundleRoutes"));

app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});