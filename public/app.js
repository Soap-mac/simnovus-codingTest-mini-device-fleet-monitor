const totalCount = document.getElementById("totalCount");
const onlineCount = document.getElementById("onlineCount");
const offlineCount = document.getElementById("offlineCount");
const deviceList = document.getElementById("deviceList");
const lastUpdated = document.getElementById("lastUpdated");

async function loadDashboard() {
    try {
        const [devicesResponse, summaryResponse] = await Promise.all([
            fetch("/devices"),
            fetch("/summary"),
        ]);

        if (!devicesResponse.ok || !summaryResponse.ok) {
            throw new Error("Failed to load fleet data");
        }

        const devices = await devicesResponse.json();
        const summary = await summaryResponse.json();

        totalCount.textContent = summary.total;
        onlineCount.textContent = summary.online;
        offlineCount.textContent = summary.offline;

        renderDevices(devices);

        lastUpdated.textContent =
            `Last updated: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
        deviceList.innerHTML = `
            <div class="error">
                Unable to load device data. Make sure the server is running.
            </div>
        `;
    }
}

function renderDevices(devices) {
    if (devices.length === 0) {
        deviceList.innerHTML = "<p>No devices registered.</p>";
        return;
    }

    deviceList.innerHTML = devices
        .map((device) => {
            const statusClass =
                device.status.toLowerCase();

            const heartbeat = device.last_heartbeat
                ? new Date(device.last_heartbeat).toLocaleString()
                : "No heartbeat received";

            return `
                <div class="device-card">
                    <div>
                        <div class="device-name">${escapeHtml(device.name)}</div>
                        <div class="device-id">${escapeHtml(device.id)}</div>
                    </div>

                    <div>
                        <span class="status ${statusClass}">
                            ${escapeHtml(device.status)}
                        </span>
                    </div>

                    <div class="heartbeat">
                        ${escapeHtml(heartbeat)}
                    </div>
                </div>
            `;
        })
        .join("");
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

loadDashboard();

setInterval(loadDashboard, 5000);