const request = require("supertest");
const app = require("../src/app");
const deviceStore = require("../src/store/deviceStore");

describe("Fleet Summary API", () => {
    beforeEach(() => {
        deviceStore.clear();
    });

    test("should return zero counts for an empty fleet", async () => {
        const response = await request(app)
            .get("/summary");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            total: 0,
            online: 0,
            offline: 0,
        });
    });

    test("should correctly summarize online and offline devices", async () => {
        await request(app)
            .post("/devices")
            .send({
                id: "device-01",
                name: "Lab Device 01",
            });

        await request(app)
            .post("/devices")
            .send({
                id: "device-02",
                name: "Lab Device 02",
            });

        await request(app)
            .post("/devices")
            .send({
                id: "device-03",
                name: "Lab Device 03",
            });

        const recentHeartbeat = new Date(
            Date.now() - 10 * 1000
        ).toISOString();

        const oldHeartbeat = new Date(
            Date.now() - 31 * 1000
        ).toISOString();

        await request(app)
            .post("/devices/device-01/heartbeat")
            .send({
                timestamp: recentHeartbeat,
                status: "OK",
            });

        await request(app)
            .post("/devices/device-02/heartbeat")
            .send({
                timestamp: oldHeartbeat,
                status: "OK",
            });

        const response = await request(app)
            .get("/summary");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            total: 3,
            online: 1,
            offline: 2,
        });
    });
});