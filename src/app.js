const express = require("express");
const path = require("path");
const deviceRoutes = require("./routes/deviceRoutes");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Device Fleet Monitor API is running",
    });
});

app.use(deviceRoutes);

module.exports = app;