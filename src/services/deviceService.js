const deviceStore = require("../store/deviceStore");
const { getDeviceStatus } = require("../utils/deviceStatus");

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
        status: getDeviceStatus(device.lastHeartbeat),
        last_heartbeat: device.lastHeartbeat,
    };
}

function recordHeartbeat(id, timestamp) {
    const device = deviceStore.findById(id);

    if (!device) {
        const error = new Error("Device not found");
        error.statusCode = 404;
        throw error;
    }

    const parsedTimestamp = new Date(timestamp);

    if (Number.isNaN(parsedTimestamp.getTime())) {
        const error = new Error("Invalid timestamp");
        error.statusCode = 400;
        throw error;
    }

    const normalizedTimestamp = parsedTimestamp.toISOString();

    return deviceStore.updateHeartbeat(id, normalizedTimestamp);
}

function getSummary() {
    const devices = deviceStore.findAll();

    let online = 0;
    let offline = 0;

    devices.forEach((device) => {
        const status = getDeviceStatus(device.lastHeartbeat);

        if (status === "ONLINE") {
            online++;
        } else {
            offline++;
        }
    });

    return {
        total: devices.length,
        online,
        offline,
    };
}

module.exports = {
    registerDevice,
    getAllDevices,
    getDeviceById,
    formatDevice,
    recordHeartbeat,
    getSummary,
};