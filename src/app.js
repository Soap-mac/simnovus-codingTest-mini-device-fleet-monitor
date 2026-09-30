const express = require("express");
const deviceRoutes = require("./routes/deviceRoutes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Device Fleet Monitor API is running",
    });
});

app.use(deviceRoutes);

module.exports = app;