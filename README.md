# Mini Device Fleet Monitor

A small REST-based device fleet monitoring application that tracks the latest heartbeat received from registered devices and dynamically determines whether each device is `ONLINE` or `OFFLINE`.

A device is considered:

* `ONLINE` when its latest heartbeat is within the last 30 seconds.
* `OFFLINE` when no heartbeat has been received or the latest heartbeat is more than 30 seconds old.

## Features

* Register devices
* Receive device heartbeats
* View all registered devices and their current status
* View details of an individual device
* View fleet-wide online/offline summary
* Simulate five devices sending heartbeats every five seconds
* Start and stop individual simulated devices
* Automated API and business-logic tests
* Validation and error handling

## Technology Stack

* Node.js
* Express
* JavaScript
* Jest
* Supertest

The application uses in-memory storage with JavaScript `Map` instead of a database. This keeps the implementation small and focused on the requirements of the 3-hour engineering exercise.

## Architecture

The application is separated into simple layers:

```text
HTTP Request
     |
     v
Routes
     |
     v
Controllers
     |
     v
Services
     |
     v
In-Memory Store
```

### Routes

Define the available HTTP endpoints and forward requests to the appropriate controller.

### Controllers

Handle HTTP-specific responsibilities such as:

* Request input
* Basic validation
* HTTP status codes
* JSON responses

### Services

Contain application/business logic such as:

* Device registration
* Device lookup
* Heartbeat processing
* Fleet summary calculation
* Device response formatting

### Store

Provides in-memory storage for registered devices and their latest heartbeat timestamp.

### Status calculation

The current fleet status is derived from `lastHeartbeat`:

```text
No heartbeat                 -> OFFLINE
Heartbeat age <= 30 seconds  -> ONLINE
Heartbeat age > 30 seconds   -> OFFLINE
```

The status is calculated when the API response is generated, so a separate background timer is not required to mark devices offline.

## Project Structure

```text
mini-device-fleet-monitor/
|
├── src/
│   ├── app.js
│   ├── server.js
│   ├── controllers/
│   │   └── deviceController.js
│   ├── routes/
│   │   └── deviceRoutes.js
│   ├── services/
│   │   └── deviceService.js
│   ├── store/
│   │   └── deviceStore.js
│   └── utils/
│       └── deviceStatus.js
│
├── tests/
│   ├── devices.test.js
│   ├── heartbeat.test.js
│   ├── status.test.js
│   └── summary.test.js
│
├── simulator/
│   └── simulator.js
│
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

Install:

* Node.js
* npm

The simulator uses Node's built-in `fetch`, so use a modern Node.js version with global `fetch` support.

## Installation

Clone the repository and enter the project directory:

```bash
git clone https://github.com/Soap-mac/simnovus-codingTest-mini-device-fleet-monitor.git
cd mini-device-fleet-monitor
```

Install dependencies:

```bash
npm install
```

## Running the Application

Start the API server:

```bash
npm start
```

The server runs on:

```text
http://localhost:5000
```

Health check:

```http
GET http://localhost:5000/health
```

Example response:

```json
{
  "status": "OK",
  "message": "Device Fleet Monitor API is running"
}
```

## Running Tests

Run the complete automated test suite:

```bash
npm test
```

The tests cover:

* Device registration
* Duplicate device handling
* Input validation
* Device retrieval
* Heartbeat handling
* Unknown devices
* Invalid timestamps
* Online/offline status calculation
* 30-second timeout boundary
* Fleet summary

## Running the Device Simulator

Start the API server first.

Then, in another terminal:

```bash
node simulator/simulator.js
```

The simulator creates/uses five devices:

```text
device-01
device-02
device-03
device-04
device-05
```

Each simulator sends a heartbeat every 5 seconds.

The simulator also provides commands for individual devices:

```text
stop device-03
start device-03
status
exit
```

### Demonstrating the Offline Timeout

Start the simulator and allow all five devices to send heartbeats.

Then run:

```text
stop device-03
```

Device 03 stops sending heartbeats, while the other four continue.

It may remain `ONLINE` immediately after stopping because its last heartbeat is still recent.

After more than 30 seconds, the API should report:

```text
device-01 -> ONLINE
device-02 -> ONLINE
device-03 -> OFFLINE
device-04 -> ONLINE
device-05 -> ONLINE
```

The summary should then contain:

```json
{
  "total": 5,
  "online": 4,
  "offline": 1
}
```

## API Documentation

### 1. Register a Device

```http
POST /devices
Content-Type: application/json
```

Request:

```json
{
  "id": "device-01",
  "name": "Lab Device 01"
}
```

Successful response:

```text
201 Created
```

Example:

```json
{
  "id": "device-01",
  "name": "Lab Device 01",
  "status": "OFFLINE",
  "last_heartbeat": null
}
```

A duplicate device ID returns:

```text
409 Conflict
```

Invalid or missing required input returns:

```text
400 Bad Request
```

### 2. Receive a Heartbeat

```http
POST /devices/device-01/heartbeat
Content-Type: application/json
```

Request:

```json
{
  "timestamp": "2026-09-30T10:30:00Z",
  "status": "OK"
}
```

Successful response:

```text
200 OK
```

Example:

```json
{
  "message": "Heartbeat received",
  "device": {
    "id": "device-01",
    "name": "Lab Device 01",
    "status": "ONLINE",
    "last_heartbeat": "2026-09-30T10:30:00.000Z"
  }
}
```

Unknown devices return:

```text
404 Not Found
```

Missing or invalid timestamps return:

```text
400 Bad Request
```

### 3. List Devices

```http
GET /devices
```

Example response:

```json
[
  {
    "id": "device-01",
    "name": "Lab Device 01",
    "status": "ONLINE",
    "last_heartbeat": "2026-09-30T10:30:00.000Z"
  },
  {
    "id": "device-02",
    "name": "Lab Device 02",
    "status": "OFFLINE",
    "last_heartbeat": "2026-09-30T10:28:00.000Z"
  }
]
```

### 4. Get Device Details

```http
GET /devices/device-01
```

Example response:

```json
{
  "id": "device-01",
  "name": "Lab Device 01",
  "status": "ONLINE",
  "last_heartbeat": "2026-09-30T10:30:00.000Z"
}
```

Unknown devices return:

```text
404 Not Found
```

### 5. Fleet Summary

```http
GET /summary
```

Example:

```json
{
  "total": 10,
  "online": 8,
  "offline": 2
}
```

## Assumptions

* Device IDs are unique.
* A newly registered device has no heartbeat and is therefore `OFFLINE`.
* The latest valid heartbeat timestamp is used to determine current device status.
* Exactly 30 seconds old is considered `ONLINE`; anything older than 30 seconds is `OFFLINE`.
* Heartbeats with timestamps older than the currently stored heartbeat do not replace the newer heartbeat.
* Heartbeat timestamps are normalized to UTC ISO 8601 format.
* The heartbeat `status` field is accepted but the fleet's `ONLINE`/`OFFLINE` state is determined from heartbeat age.

## Known Limitations

* Device data is stored in memory and is lost when the application restarts.
* There is no authentication or authorization.
* There is no persistent heartbeat history.
* There is no production monitoring, metrics system, or distributed storage.
* The project currently focuses on the required APIs and simulator rather than a production frontend.

## What I Would Improve With One Additional Day

With an additional day, I would consider:

* Persistent database storage
* Heartbeat history and historical device events
* Structured logging
* Configuration through environment variables
* More comprehensive API validation
* Authentication and authorization
* Docker/container support
* API documentation such as OpenAPI/Swagger
* A simple monitoring dashboard
* Additional integration and concurrency tests

## AI Usage

I used ChatGPT as an engineering assistant during development.

It was used for:

* Breaking the assignment into manageable implementation phases
* Reviewing the application architecture
* Discussing the 30-second timeout design
* Designing automated tests
* Reviewing error handling and the simulator approach
* Debugging implementation issues

I reviewed and tested the generated code before keeping it in the project.

One AI suggestion that I changed was the initial development server port. The initial suggestion used port `3000`; I changed the application to use port `5000` for my local setup.

One important behavior I personally verified before submission was the complete simulator flow: five devices send heartbeats, one simulator can be stopped independently, and that device becomes `OFFLINE` after the 30-second timeout while the other devices remain `ONLINE`.
