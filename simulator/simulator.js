const readline = require("readline");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

const DEVICES = [
    {
        id: "device-01",
        name: "Lab Device 01",
    },
    {
        id: "device-02",
        name: "Lab Device 02",
    },
    {
        id: "device-03",
        name: "Lab Device 03",
    },
    {
        id: "device-04",
        name: "Lab Device 04",
    },
    {
        id: "device-05",
        name: "Lab Device 05",
    },
];

const HEARTBEAT_INTERVAL_MS = 5 * 1000;

const timers = new Map();

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    let body = null;

    try {
        body = await response.json();
    } catch {
        // Response may not contain JSON.
    }

    return {
        status: response.status,
        body,
    };
}

async function registerDevice(device) {
    const response = await request("/devices", {
        method: "POST",
        body: JSON.stringify(device),
    });

    if (response.status === 201) {
        console.log(`✓ ${device.id} registered`);
        return;
    }

    if (response.status === 409) {
        console.log(`• ${device.id} already registered`);
        return;
    }

    throw new Error(
        `Failed to register ${device.id}: ${response.status} ${JSON.stringify(
            response.body
        )}`
    );
}

async function sendHeartbeat(device) {
    try {
        const response = await request(
            `/devices/${device.id}/heartbeat`,
            {
                method: "POST",
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    status: "OK",
                }),
            }
        );

        if (response.status === 200) {
            console.log(
                `♥ ${device.id} heartbeat sent at ${new Date().toISOString()}`
            );
            return;
        }

        console.error(
            `✗ ${device.id} heartbeat failed: ${response.status}`,
            response.body
        );
    } catch (error) {
        console.error(
            `✗ ${device.id} heartbeat error: ${error.message}`
        );
    }
}

function startDevice(device) {
    if (timers.has(device.id)) {
        console.log(`• ${device.id} is already running`);
        return;
    }

    // Send one heartbeat immediately.
    sendHeartbeat(device);

    const timer = setInterval(() => {
        sendHeartbeat(device);
    }, HEARTBEAT_INTERVAL_MS);

    timers.set(device.id, timer);

    console.log(`▶ ${device.id} simulator started`);
}

function stopDevice(deviceId) {
    const timer = timers.get(deviceId);

    if (!timer) {
        console.log(`• ${deviceId} is already stopped`);
        return;
    }

    clearInterval(timer);
    timers.delete(deviceId);

    console.log(
        `■ ${deviceId} stopped — it will become OFFLINE after the timeout`
    );
}

function printSimulatorStatus() {
    console.log("\nSimulator status:");

    for (const device of DEVICES) {
        const running = timers.has(device.id);

        console.log(
            `  ${device.id} → ${running ? "RUNNING" : "STOPPED"}`
        );
    }

    console.log();
}

async function startSimulator() {
    console.log(`Connecting to ${API_BASE_URL}...\n`);

    for (const device of DEVICES) {
        await registerDevice(device);
    }

    console.log("\nStarting device simulators...\n");

    for (const device of DEVICES) {
        startDevice(device);
    }

    console.log(`
Commands:
  stop device-01
  start device-01
  status
  exit
`);
}

function handleCommand(input) {
    const parts = input.trim().split(/\s+/);

    if (!parts[0]) {
        return;
    }

    const command = parts[0].toLowerCase();
    const deviceId = parts[1];

    if (command === "stop") {
        if (!deviceId) {
            console.log("Usage: stop device-01");
            return;
        }

        const device = DEVICES.find((item) => item.id === deviceId);

        if (!device) {
            console.log(`Unknown device: ${deviceId}`);
            return;
        }

        stopDevice(deviceId);
        return;
    }

    if (command === "start") {
        if (!deviceId) {
            console.log("Usage: start device-01");
            return;
        }

        const device = DEVICES.find((item) => item.id === deviceId);

        if (!device) {
            console.log(`Unknown device: ${deviceId}`);
            return;
        }

        startDevice(device);
        return;
    }

    if (command === "status") {
        printSimulatorStatus();
        return;
    }

    if (command === "exit" || command === "quit") {
        shutdown();
        return;
    }

    console.log(
        "Unknown command. Use: stop <id>, start <id>, status, exit"
    );
}

function shutdown() {
    console.log("\nStopping simulator...");

    for (const timer of timers.values()) {
        clearInterval(timer);
    }

    timers.clear();

    process.exit(0);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on("line", handleCommand);

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startSimulator().catch((error) => {
    console.error(`Simulator failed: ${error.message}`);
    shutdown();
});