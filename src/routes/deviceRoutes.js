const express = require("express");
const deviceController = require("../controllers/deviceControllers");

const router = express.Router();

router.post("/devices", deviceController.registerDevice);
router.get("/devices", deviceController.getDevices);
router.get("/devices/:id", deviceController.getDevice);

module.exports = router;