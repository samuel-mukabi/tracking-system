/**
 * Driver Location Simulator
 * Simulates realistic driver movements with random variations
 * Sends location updates via WebSocket to the tracking server
 */

import { WebSocket } from 'ws';
import { ROAD_PATHS } from "./route-points.js";

interface DriverData {
    driverId: string;
    lat: number;
    lon: number;
    heading: number; // Direction in degrees (0-360)
    speed: number; // Speed in km/h
    routeIndex?: number;
}


// Driver routes (starting positions and general direction)
// Using Nairobi, Kenya as a center with random variations
// Generate 100 drivers with randomized starting positions
function generateDriverRoutes(): Record<string, { startLat: number; startLon: number; name: string }> {
    const routes: Record<string, { startLat: number; startLon: number; name: string }> = {};

    // Nairobi center coordinates
    const centerLat = -1.2921;
    const centerLon = 36.8219;

    // Variation range (roughly 20km radius around the center)
    const latVariation = 0.15; // approx 15km
    const lonVariation = 0.15;

    const areas = [
        'Nairobi CBD',
        'Westlands',
        'Karen',
        'Lavington',
        'Parklands',
        'Kilimani',
        'Upperhill',
        'Langata',
        'Muthaiga',
        'Riverside',
    ];

    for (let i = 1; i <= 100; i++) {
        const driverId = `driver_${String(i).padStart(3, '0')}`;
        const startLat = centerLat + (Math.random() - 0.5) * latVariation * 2;
        const startLon = centerLon + (Math.random() - 0.5) * lonVariation * 2;
        const areaIndex = (i - 1) % areas.length;

        routes[driverId] = {
            startLat,
            startLon,
            name: `Driver ${i} - ${areas[areaIndex]}`,
        };
    }

    return routes;
}

const DRIVER_ROUTES = generateDriverRoutes();

const SIMULATION_INTERVAL = 1000; // Update every 1 second
const SERVER_URL = process.env.SERVER_URL || `ws://localhost:${process.env.PORT || '8080'}`;

class DriverSimulator {
    private drivers: Map<string, DriverData> = new Map();
    private ws: WebSocket | null = null;
    private simulationIntervals: Map<string, NodeJS.Timeout> = new Map();
    private isConnected = false;

    constructor() {
        // Initialize drivers
        Object.entries(DRIVER_ROUTES).forEach(([driverId, route]) => {
            this.drivers.set(driverId, {
                driverId,
                lat: route.startLat,
                lon: route.startLon,
                heading: Math.random() * 360,
                speed: this.getRandomSpeed(),
                routeIndex: 0,
            });
        });
    }

    /**
     * Connect to the WebSocket server
     */
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(SERVER_URL);

                this.ws.on('open', () => {
                    console.log(`✓ Connected to server at ${SERVER_URL}`);
                    this.isConnected = true;
                    resolve();
                    this.startSimulation();
                });

                this.ws.on('error', (error: Error) => {
                    console.error('WebSocket error:', error.message);
                    reject(error);
                });

                this.ws.on('close', () => {
                    console.log('Disconnected from server, attempting to reconnect...');
                    this.isConnected = false;
                    this.stopSimulation();
                    setTimeout(() => this.connect(), 5000);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Start simulating driver movements
     */
    private startSimulation(): void {
        this.drivers.forEach((_, driverId) => {
            // Start simulation for each driver
            const interval = setInterval(() => {
                this.updateDriverLocation(driverId);
            }, SIMULATION_INTERVAL);

            this.simulationIntervals.set(driverId, interval);
        });

        console.log(`✓ Started simulating ${this.drivers.size} drivers`);
    }

    /**
     * Stop all driver simulations
     */
    private stopSimulation(): void {
        this.simulationIntervals.forEach((interval) => {
            clearInterval(interval);
        });
        this.simulationIntervals.clear();
    }

    /**
     * Update a single driver's location with realistic movement
     */
    private updateDriverLocation(driverId: string): void {
        const driver = this.drivers.get(driverId);
        if (!driver) return;

        const path = ROAD_PATHS[driverId];
        if (!path || path.length === 0) return;

        // Ensure routeIndex is initialized
        if (driver.routeIndex === undefined) {
            driver.routeIndex = 0;
        }

        const target = path[driver.routeIndex];
        if (!target) return;

        const latDiff = target.lat - driver.lat;
        const lonDiff = target.lon - driver.lon;

        // Calculate heading based on direction of travel
        const angleRad = Math.atan2(lonDiff, latDiff);
        driver.heading = (angleRad * 180) / Math.PI;
        if (driver.heading < 0) driver.heading += 360;

        const step = 0.00005;

        driver.lat += Math.sign(latDiff) * Math.min(Math.abs(latDiff), step);
        driver.lon += Math.sign(lonDiff) * Math.min(Math.abs(lonDiff), step);

        if (Math.abs(latDiff) < step && Math.abs(lonDiff) < step) {
            driver.routeIndex = (driver.routeIndex + 1) % path.length;
        }
        // Send updated location to server
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({
                type: 'LOCATION_UPDATE',
                driverId: driver.driverId,
                lat: driver.lat,
                lon: driver.lon,
                heading: driver.heading,
                speed: driver.speed,
                timestamp: new Date().toISOString(),
            }));
        }
    }

    /**
     * Get a random speed between 20-80 km/h
     */
    private getRandomSpeed(): number {
        return 20 + Math.random() * 60;
    }

    /**
     * Get current driver positions
     */
    getDrivers(): Record<string, DriverData> {
        const result: Record<string, DriverData> = {};
        this.drivers.forEach((driver) => {
            result[driver.driverId] = { ...driver };
        });
        return result;
    }

    /**
     * Set a specific driver's position (useful for testing)
     */
    setDriverPosition(_driverId: string, _lat: number, _lon: number): void {
        const driver = this.drivers.get(_driverId);
        if (driver) {
            driver.lat = _lat;
            driver.lon = _lon;
            console.log(`Set ${_driverId} position to (${_lat}, ${_lon})`);
        }
    }

    /**
     * Pause simulation
     */
    pause(): void {
        this.stopSimulation();
        console.log('✓ Simulation paused');
    }

    /**
     * Resume simulation
     */
    resume(): void {
        if (this.isConnected) {
            this.startSimulation();
            console.log('✓ Simulation resumed');
        }
    }

    /**
     * Get simulation status
     */
    getStatus(): void {
        console.log('\n=== Driver Simulator Status ===');
        console.log(`Connection: ${this.isConnected ? '✓ Connected' : '✗ Disconnected'}`);
        console.log(`Drivers: ${this.drivers.size}`);
        console.log('\nDriver Positions:');
        this.drivers.forEach((driver) => {
            console.log(
                `  ${driver.driverId}: (${driver.lat.toFixed(4)}, ${driver.lon.toFixed(4)}) - Speed: ${driver.speed.toFixed(1)} km/h`
            );
        });
        console.log('===============================\n');
    }
}

// Main execution
async function main() {
    const simulator = new DriverSimulator();

    try {
        await simulator.connect();

        // Print status every 30 seconds
        setInterval(() => {
            simulator.getStatus();
        }, 30000);

        // Handle process signals
        process.on('SIGINT', () => {
            console.log('\nShutting down simulator...');
            simulator.pause();
            process.exit(0);
        });

        console.log('Driver Simulator running. Press Ctrl+C to stop.\n');
    } catch (error) {
        console.error('Failed to start simulator:', error);
        process.exit(1);
    }
}

main();
