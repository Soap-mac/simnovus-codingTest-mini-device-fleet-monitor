const request = require("supertest");
const app = require("../src/app");
const deviceStore = require("../src/store/deviceStore");

describe("Heartbeat API", () => {
    beforeEach(() => {
        deviceStore.clear();
    });

    async function registerDevice() {
        await request(app)
            .post("/devices")
            .send({
                id: "device-01",
                name: "Lab Device 01",
            });
    }

    test("should accept a heartbeat from a registered device", async () => {
        await registerDevice();

        const response = await request(app)
            .post("/devices/device-01/heartbeat")
            .send({
                timestamp: "2026-09-30T10:30:00Z",
                status: "OK",
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.message).toBe("Heartbeat received");
        expect(response.body.device.id).toBe("device-01");
        expect(response.body.device.last_heartbeat).toBe(
            "2026-09-30T10:30:00.000Z"
        );
    });

    test("should reject heartbeat for an unknown device", async () => {
        const response = await request(app)
            .post("/devices/unknown-device/heartbeat")
            .send({
                timestamp: "2026-09-30T10:30:00Z",
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("Device not found");
    });

    test("should reject heartbeat without a timestamp", async () => {
        await registerDevice();

        const response = await request(app)
            .post("/devices/device-01/heartbeat")
            .send({
                status: "OK",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Timestamp is required");
    });

    test("should reject heartbeat with an invalid timestamp", async () => {
        await registerDevice();

        const response = await request(app)
            .post("/devices/device-01/heartbeat")
            .send({
                timestamp: "not-a-real-date",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Invalid timestamp");
    });
});