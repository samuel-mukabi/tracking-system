export type RoutePoint = {
    lat: number;
    lon: number;
};

// Generate realistic route paths for all drivers
export function generateRoutePaths(): Record<string, RoutePoint[]> {
    const paths: Record<string, RoutePoint[]> = {};


    // Generate routes for 100 drivers
    for (let i = 1; i <= 100; i++) {
        const driverId = `driver_${String(i).padStart(3, '0')}`;

        // Spread drivers across the whole country
        const startLat = -4.6 + Math.random() * (5.4 - (-4.6));
        const startLon = 33.9 + Math.random() * (41.8 - 33.9);

        // Generate 8-12 waypoints for each driver's route
        const numWaypoints = 15 + Math.floor(Math.random() * 10);
        const waypoints: RoutePoint[] = [
            { lat: startLat, lon: startLon }
        ];

        // Create a random path with realistic movements
        let currentLat = startLat;
        let currentLon = startLon;

        for (let j = 1; j < numWaypoints; j++) {
            // Larger random movements to cover more ground
            const latChange = (Math.random() - 0.5) * 0.5;
            const lonChange = (Math.random() - 0.5) * 0.5;

            currentLat += latChange;
            currentLon += lonChange;

            // Keep drivers within Kenya borders
            currentLat = Math.max(-4.6, Math.min(5.4, currentLat));
            currentLon = Math.max(33.9, Math.min(41.8, currentLon));

            waypoints.push({ lat: currentLat, lon: currentLon });
        }

        // Close the loop - return to start
        waypoints.push({ lat: startLat, lon: startLon });

        paths[driverId] = waypoints;
    }

    return paths;
}

export const ROAD_PATHS = generateRoutePaths();
