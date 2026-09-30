const DEVICE_STATUS = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  MAINTENANCE: 'MAINTENANCE',
};

function evaluateStatus(lastHeartbeat, thresholdMs = 30000) {
  if (!lastHeartbeat) return DEVICE_STATUS.OFFLINE;
  const diff = Date.now() - new Date(lastHeartbeat).getTime();
  return diff > thresholdMs ? DEVICE_STATUS.OFFLINE : DEVICE_STATUS.ONLINE;
}

module.exports = { DEVICE_STATUS, evaluateStatus };