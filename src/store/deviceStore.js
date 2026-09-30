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

module.exports = {
    create,
    findById,
    findAll,
    exists,
    clear,
};