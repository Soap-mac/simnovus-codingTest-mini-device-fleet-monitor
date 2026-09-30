const OFFLINE_TIMEOUT_MS = 30 * 1000;

function getDeviceStatus(lastHeartbeat, now = new Date()) {
    if (!lastHeartbeat) {
        return "OFFLINE";
    }

    const heartbeatTime = new Date(lastHeartbeat).getTime();
    const currentTime = new Date(now).getTime();

    const heartbeatAge = currentTime - heartbeatTime;

    if (heartbeatAge <= OFFLINE_TIMEOUT_MS) {
        return "ONLINE";
    }

    return "OFFLINE";
}

module.exports = {
    getDeviceStatus,
    OFFLINE_TIMEOUT_MS,
};