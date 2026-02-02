export type RoutePoint = {
    lat: number;
    lon: number;
};

// Generate realistic route paths for all drivers
function generateRoutePaths(): Record<string, RoutePoint[]> {
    const paths: Record<string, RoutePoint[]> = {};

    // Nairobi center coordinates
    const centerLat = -1.2921;
    const centerLon = 36.8219;

    // Generate routes for 100 drivers
    for (let i = 1; i <= 100; i++) {
        const driverId = `driver_${String(i).padStart(3, '0')}`;

        // Random starting position
        const startLat = centerLat + (Math.random() - 0.5) * 0.15 * 2;
        const startLon = centerLon + (Math.random() - 0.5) * 0.15 * 2;

        // Generate 8-12 waypoints for each driver's route
        const numWaypoints = 8 + Math.floor(Math.random() * 5);
        const waypoints: RoutePoint[] = [
            { lat: startLat, lon: startLon }
        ];

        // Create a random path with realistic movements
        let currentLat = startLat;
        let currentLon = startLon;

        for (let j = 1; j < numWaypoints; j++) {
            // Small random movements (±0.002 degrees ≈ ±200 meters)
            const latChange = (Math.random() - 0.5) * 0.004;
            const lonChange = (Math.random() - 0.5) * 0.004;

            currentLat += latChange;
            currentLon += lonChange;

            // Keep drivers within Nairobi area
            currentLat = Math.max(-1.4, Math.min(-1.18, currentLat));
            currentLon = Math.max(36.70, Math.min(36.95, currentLon));

            waypoints.push({ lat: currentLat, lon: currentLon });
        }

        // Close the loop - return to start
        waypoints.push({ lat: startLat, lon: startLon });

        paths[driverId] = waypoints;
    }

    return paths;
}

export const ROAD_PATHS = generateRoutePaths();
