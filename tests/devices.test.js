const request = require("supertest");
const app = require("../src/app");
const deviceStore = require("../src/store/deviceStore");

describe("Device API", () => {
    beforeEach(() => {
        deviceStore.clear();
    });

    test("should register a device", async () => {
        const response = await request(app)
            .post("/devices")
            .send({
                id: "device-01",
                name: "Lab Device 01",
            });

        expect(response.statusCode).toBe(201);

        expect(response.body).toEqual({
            id: "device-01",
            name: "Lab Device 01",
            status: "OFFLINE",
            last_heartbeat: null,
        });
    });

    test("should reject duplicate device id", async () => {
        await request(app)
            .post("/devices")
            .send({
                id: "device-01",
                name: "Lab Device 01",
            });

        const response = await request(app)
            .post("/devices")
            .send({
                id: "device-01",
                name: "Another Device",
            });

        expect(response.statusCode).toBe(409);
        expect(response.body.error).toBe("Device already exists");
    });

    test("should reject missing device id", async () => {
        const response = await request(app)
            .post("/devices")
            .send({
                name: "Lab Device 01",
            });

        expect(response.statusCode).toBe(400);
    });

    test("should reject missing device name", async () => {
        const response = await request(app)
            .post("/devices")
            .send({
                id: "device-01",
            });

        expect(response.statusCode).toBe(400);
    });

    test("should list all devices", async () => {
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

        const response = await request(app)
            .get("/devices");

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0].id).toBe("device-01");
        expect(response.body[1].id).toBe("device-02");
    });

    test("should get one device by id", async () => {
        await request(app)
            .post("/devices")
            .send({
                id: "device-01",
                name: "Lab Device 01",
            });

        const response = await request(app)
            .get("/devices/device-01");

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe("device-01");
        expect(response.body.name).toBe("Lab Device 01");
    });

    test("should return 404 for unknown device", async () => {
        const response = await request(app)
            .get("/devices/unknown-device");

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("Device not found");
    });
});