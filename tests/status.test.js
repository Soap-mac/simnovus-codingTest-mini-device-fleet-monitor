const {
    getDeviceStatus,
} = require("../src/utils/deviceStatus");

describe("Device status calculation", () => {
    const heartbeatTime = new Date("2026-09-30T10:00:00.000Z");

    test("should be OFFLINE when there is no heartbeat", () => {
        const status = getDeviceStatus(null, heartbeatTime);

        expect(status).toBe("OFFLINE");
    });

    test("should be ONLINE when heartbeat is less than 30 seconds old", () => {
        const now = new Date("2026-09-30T10:00:20.000Z");

        const status = getDeviceStatus(
            heartbeatTime,
            now
        );

        expect(status).toBe("ONLINE");
    });

    test("should be ONLINE when heartbeat is exactly 30 seconds old", () => {
        const now = new Date("2026-09-30T10:00:30.000Z");

        const status = getDeviceStatus(
            heartbeatTime,
            now
        );

        expect(status).toBe("ONLINE");
    });

    test("should be OFFLINE when heartbeat is more than 30 seconds old", () => {
        const now = new Date("2026-09-30T10:00:31.000Z");

        const status = getDeviceStatus(
            heartbeatTime,
            now
        );

        expect(status).toBe("OFFLINE");
    });
});