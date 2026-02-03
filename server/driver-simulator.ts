/**
 * Driver Location Simulator
 * Simulates realistic driver movements with random variations
 * Sends location updates via WebSocket to the tracking server
 */

import { WebSocket } from 'ws';
import {ROAD_PATHS} from "./route-points.ts";

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

    // Kenya geographic bounds
    const minLat = -4.6;
    const maxLat = 5.4;
    const minLon = 33.9;
    const maxLon = 41.8;

    const areas = [
        "Kenya"
    ];

    for (let i = 1; i <= 100; i++) {
        const driverId = `driver_${String(i).padStart(3, '0')}`;
        const startLat = minLat + Math.random() * (maxLat - minLat);
        const startLon = minLon + Math.random() * (maxLon - minLon);
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
     * Update a single driver's location following their pre-generated path
     */
    private updateDriverLocation(driverId: string): void {
        const driver = this.drivers.get(driverId);
        if (!driver) return;

        const path = ROAD_PATHS[driverId];
        if (!path || path.length === 0) return;

        // Current and next waypoint
        const currentIndex = driver.routeIndex || 0;
        const nextIndex = (currentIndex + 1) % path.length;
        
        const currentPos = path[currentIndex];
        const nextPos = path[nextIndex];

        if (!currentPos || !nextPos) return;

        // Linear interpolation between waypoints for smooth-ish movement
        // In a real app, this would be more sophisticated
        const progress = 0.1; // Move 10% towards next waypoint each second
        
        driver.lat = currentPos.lat + (nextPos.lat - currentPos.lat) * progress;
        driver.lon = currentPos.lon + (nextPos.lon - currentPos.lon) * progress;
        
        // Update the actual waypoint in the path to reflect current position 
        // OR just increment index if we are close enough.
        // For simplicity, let's just move towards the next waypoint and update index
        
        // Update index if we've reached (or passed) the next waypoint significantly
        // or just move through the path linearly for simulation purposes.
        if (Math.abs(driver.lat - nextPos.lat) < 0.001 && Math.abs(driver.lon - nextPos.lon) < 0.001) {
            driver.routeIndex = nextIndex;
        } else {
            // Keep moving towards nextPos
            path[currentIndex] = { lat: driver.lat, lon: driver.lon };
        }

        // Keep drivers inside Kenya
        driver.lat = Math.max(-4.6, Math.min(5.4, driver.lat));
        driver.lon = Math.max(33.9, Math.min(41.8, driver.lon));

        // Randomly "shake" the path every second as requested
        driver.lat += (Math.random() - 0.5) * 0.002;
        driver.lon += (Math.random() - 0.5) * 0.002;

        // Update heading based on movement direction
        const latChange = nextPos.lat - currentPos.lat;
        const lonChange = nextPos.lon - currentPos.lon;
        const angleRad = Math.atan2(lonChange, latChange);
        driver.heading = (angleRad * 180) / Math.PI;
        if (driver.heading < 0) driver.heading += 360;

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
