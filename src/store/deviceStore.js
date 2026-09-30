const devices = new Map();

function create(device) {
    devices.set(device.id, device);
    return device;
}

function findById(id) {
    return devices.get(id);
}

function findAll() {
    return Array.from(devices.values());
}

function exists(id) {
    return devices.has(id);
}

function clear() {
    devices.clear();
}

function updateHeartbeat(id, timestamp) {
    const device = devices.get(id);

    if (!device) {
        return null;
    }

    if (
        device.lastHeartbeat &&
        new Date(timestamp) <= new Date(device.lastHeartbeat)
    ) {
        return device;
    }

    device.lastHeartbeat = timestamp;

    return device;
}

module.exports = {
    create,
    findById,
    findAll,
    exists,
    clear,
    updateHeartbeat,
};