/**
 * Manual GPS Test Client
 *
 * Use this to manually send location updates for testing purposes
 * Useful for testing specific scenarios without running the full simulator
 *
 * Usage: npx ts-node test-client.ts
 */

import { WebSocket } from 'ws';
import type { RawData } from 'ws';
import { createInterface } from 'readline';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

const SERVER_URL = process.env.SERVER_URL || 'ws://localhost:8080';

let ws: WebSocket | null = null;

/**
 * Connect to the WebSocket server
 */
function connect(): Promise<void> {
    return new Promise((resolve, reject) => {
        ws = new WebSocket(SERVER_URL);

        ws.on('open', () => {
            console.log(`✓ Connected to ${SERVER_URL}`);
            resolve();
        });

        ws.on('error', (error: Error) => {
            console.error('Connection error:', error.message);
            reject(error);
        });

        ws.on('message', (data: RawData) => {
            console.log(`📨 Received: ${data}`);
        });

        ws.on('close', () => {
            console.log('Disconnected from server');
        });
    });
}

/**
 * Send a location update
 */
function sendLocation(driverId: string, lat: number, lon: number): void {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.error('Not connected to server');
        return;
    }

    const message = {
        type: 'LOCATION_UPDATE',
        driverId,
        lat: parseFloat(lat.toFixed(6)),
        lon: parseFloat(lon.toFixed(6)),
    };

    ws.send(JSON.stringify(message));
    console.log(`📤 Sent: ${JSON.stringify(message)}`);
}

/**
 * Interactive menu
 */
function showMenu(): void {
    console.log('\n=== GPS Test Client Menu ===');
    console.log('1. Send location update');
    console.log('2. Send batch locations');
    console.log('3. Simulate route');
    console.log('4. Quick test (3 drivers)');
    console.log('5. Exit');
    console.log('============================\n');
}

/**
 * Interactive prompt
 */
function prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

/**
 * Option 1: Send a single location
 */
async function sendSingleLocation(): Promise<void> {
    const driverId = await prompt('Driver ID (default: driver_01): ') || 'driver_01';
    const lat = parseFloat(await prompt('Latitude (e.g., -1.2921): '));
    const lon = parseFloat(await prompt('Longitude (e.g., 36.8219): '));

    if (isNaN(lat) || isNaN(lon)) {
        console.error('Invalid coordinates');
        return;
    }

    sendLocation(driverId, lat, lon);
}

/**
 * Option 2: Send multiple locations
 */
async function sendBatchLocations(): Promise<void> {
    const count = parseInt(await prompt('Number of locations: '));
    const startLat = parseFloat(await prompt('Start latitude: '));
    const startLon = parseFloat(await prompt('Start longitude: '));
    const driverId = await prompt('Driver ID (default: driver_01): ') || 'driver_01';
    const interval = parseInt(await prompt('Interval between updates (ms, default: 1000): ')) || 1000;

    if (isNaN(count) || isNaN(startLat) || isNaN(startLon)) {
        console.error('Invalid input');
        return;
    }

    console.log(`Sending ${count} locations...`);

    let lat = startLat;
    let lon = startLon;

    for (let i = 0; i < count; i++) {
        sendLocation(driverId, lat, lon);
        lat += 0.001; // Move slightly
        lon += 0.001;

        if (i < count - 1) {
            await new Promise((resolve) => setTimeout(resolve, interval));
        }
    }

    console.log('✓ Batch complete');
}

/**
 * Option 3: Simulate a route
 */
async function simulateRoute(): Promise<void> {
    const driverId = await prompt('Driver ID (default: driver_01): ') || 'driver_01';
    const routeName = await prompt('Route name (default: Nairobi): ') || 'Nairobi';

    // Example routes
    const routes: Record<
        string,
        Array<{
            lat: number;
            lon: number;
            name: string;
        }>
    > = {
        Nairobi: [
            { lat: -1.2921, lon: 36.8219, name: 'CBD' },
            { lat: -1.3159, lon: 36.7833, name: 'Westlands' },
            { lat: -1.2857, lon: 36.8216, name: 'Karen' },
            { lat: -1.2700, lon: 36.8500, name: 'Bomas' },
        ],
        test: [
            { lat: 0, lon: 0, name: 'Origin' },
            { lat: 0.1, lon: 0.1, name: 'Point 1' },
            { lat: 0.2, lon: 0.2, name: 'Point 2' },
        ],
    };

    const route = routes[routeName];
    if (!route) {
        console.error(`Route "${routeName}" not found`);
        return;
    }

    console.log(`Simulating ${routeName} route for ${driverId}...`);

    for (let i = 0; i < route.length; i++) {
        const point = route[i];
        if (!point) continue;

        sendLocation(driverId, point.lat, point.lon);
        console.log(`  → ${point.name}`);

        if (i < route.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }

    console.log('✓ Route complete');
}

/**
 * Option 4: Quick test - send 3 drivers
 */
async function quickTest(): Promise<void> {
    console.log('Sending quick test data for 3 drivers...');

    const drivers = [
        { id: 'driver_01', lat: -1.2921, lon: 36.8219 },
        { id: 'driver_02', lat: -1.3159, lon: 36.7833 },
        { id: 'driver_03', lat: -1.2857, lon: 36.8216 },
    ];

    for (const driver of drivers) {
        sendLocation(driver.id, driver.lat, driver.lon);
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log('✓ Quick test complete');
}

/**
 * Main loop
 */
async function main(): Promise<void> {
    try {
        await connect();

        let running = true;
        while (running) {
            showMenu();
            const choice = await prompt('Select option: ');

            switch (choice) {
                case '1':
                    await sendSingleLocation();
                    break;
                case '2':
                    await sendBatchLocations();
                    break;
                case '3':
                    await simulateRoute();
                    break;
                case '4':
                    await quickTest();
                    break;
                case '5':
                    running = false;
                    break;
                default:
                    console.error('Invalid option');
            }
        }

        console.log('Goodbye!');
        rl.close();
        ws?.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
