const deviceStore = require("../store/deviceStore");

function registerDevice(id, name) {
    if (deviceStore.exists(id)) {
        const error = new Error("Device already exists");
        error.statusCode = 409;
        throw error;
    }

    const device = {
        id,
        name,
        lastHeartbeat: null,
    };

    return deviceStore.create(device);
}

function getAllDevices() {
    return deviceStore.findAll();
}

function getDeviceById(id) {
    const device = deviceStore.findById(id);

    if (!device) {
        const error = new Error("Device not found");
        error.statusCode = 404;
        throw error;
    }

    return device;
}

function formatDevice(device) {
    return {
        id: device.id,
        name: device.name,
        last_heartbeat: device.lastHeartbeat,
        status: device.status || "OFFLINE",
    };
}

module.exports = {
    registerDevice,
    getAllDevices,
    getDeviceById,
    formatDevice,
};