const deviceService = require("../services/deviceService");

function registerDevice(req, res) {
    try {
        const { id, name } = req.body;

        if (!id || typeof id !== "string" || !id.trim()) {
            return res.status(400).json({
                error: "Device id is required",
            });
        }

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                error: "Device name is required",
            });
        }

        const device = deviceService.registerDevice(
            id.trim(),
            name.trim()
        );

        return res.status(201).json(
            deviceService.formatDevice(device)
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            error: error.message || "Internal server error",
        });
    }
}

function getDevices(req, res) {
    try {
        const devices = deviceService.getAllDevices();

        return res.status(200).json(
            devices.map(deviceService.formatDevice)
        );
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error",
        });
    }
}

function getDevice(req, res) {
    try {
        const device = deviceService.getDeviceById(req.params.id);

        return res.status(200).json(
            deviceService.formatDevice(device)
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            error: error.message || "Internal server error",
        });
    }
}

function recordHeartbeat(req, res) {
    try {
        const { timestamp } = req.body;

        if (!timestamp) {
            return res.status(400).json({
                error: "Timestamp is required",
            });
        }

        const device = deviceService.recordHeartbeat(
            req.params.id,
            timestamp
        );

        return res.status(200).json({
            message: "Heartbeat received",
            device: deviceService.formatDevice(device),
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            error: error.message || "Internal server error",
        });
    }
}

function getSummary(req, res) {
    try {
        const summary = deviceService.getSummary();

        return res.status(200).json(summary);
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error",
        });
    }
}

module.exports = {
    registerDevice,
    getDevices,
    getDevice,
    recordHeartbeat,
    getSummary,
};