/**
 * GPS Data Provider Examples
 * Different ways to collect and send real GPS data to your tracking system
 */

import WebSocket from 'ws';

/**
 * Example 1: Simple Mobile App GPS Data Receiver
 *
 * Your mobile app would send GPS data like this:
 */
export async function sendGPSDataExample() {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        // Simulate receiving GPS data from a mobile device
        const mockGPSData = {
            driverId: 'driver_01',
            lat: -1.2921,
            lon: 36.8219,
            timestamp: Date.now(),
            accuracy: 5, // meters
        };

        ws.send(
            JSON.stringify({
                type: 'LOCATION_UPDATE',
                driverId: mockGPSData.driverId,
                lat: mockGPSData.lat,
                lon: mockGPSData.lon,
            })
        );
    };
}

/**
 * Example 2: Poll-based GPS Data (e.g., from a mobile API)
 *
 * Periodically fetch driver GPS data from a mobile backend
 */
export class MobileGPSPoller {
    private ws: WebSocket | null = null;
    private pollInterval: NodeJS.Timeout | undefined;

    async connect(serverUrl: string): Promise<void> {
        return new Promise((resolve) => {
            this.ws = new WebSocket(serverUrl);
            this.ws.onopen = () => resolve();
        });
    }

    /**
     * Poll driver GPS data from a mobile API endpoint
     */
    async startPolling(mobileApiUrl: string, pollIntervalMs: number = 5000): Promise<void> {
        this.pollInterval = setInterval(async () => {
            try {
                // Example: fetch from your mobile backend
                const response = await fetch(mobileApiUrl);
                const drivers = (await response.json()) as Array<{
                    driverId: string;
                    lat: number;
                    lon: number;
                }>;

                // Send each driver's location to your tracking server
                drivers.forEach((driver) => {
                    if (this.ws?.readyState === WebSocket.OPEN) {
                        this.ws.send(
                            JSON.stringify({
                                type: 'LOCATION_UPDATE',
                                driverId: driver.driverId,
                                lat: driver.lat,
                                lon: driver.lon,
                            })
                        );
                    }
                });
            } catch (error) {
                console.error('Error polling GPS data:', error);
            }
        }, pollIntervalMs);
    }

    stop(): void {
        if (this.pollInterval) clearInterval(this.pollInterval);
    }
}

/**
 * Example 3: Google Maps API Integration
 *
 * Use Google Maps API to get location-based data
 */
export async function integrateGoogleMaps(driverId: string) {
    // Example: Track driver movement using Google Maps API
    // Requires: @googlemaps/js-api-loader package

    // This is pseudocode - implement based on your needs:
    // const loader = new Loader({ apiKey: GOOGLE_MAPS_API_KEY });
    // const maps = await loader.load();
    //
    // const tracking = new maps.tracking.Tracker({
    //     driverId: driverId,
    //     onLocationChange: (location) => {
    //         sendLocationUpdate(location.lat(), location.lng());
    //     },
    // });
}

/**
 * Example 4: Hardware GPS Device Integration
 *
 * Connect to a physical GPS device (e.g., GPS tracker hardware)
 */
export class HardwareGPSIntegration {
    /**
     * Example: Connect to a GPS device via MQTT
     * Requires: mqtt package
     */
    async connectToMQTT(brokerUrl: string, serverWsUrl: string): Promise<void> {
        // const mqtt = require('mqtt');
        // const client = mqtt.connect(brokerUrl);
        //
        // client.on('connect', () => {
        //     client.subscribe('gps/drivers/#');
        // });
        //
        // client.on('message', (topic, message) => {
        //     const data = JSON.parse(message.toString());
        //     const driverId = topic.split('/')[2]; // e.g., gps/drivers/driver_01
        //
        //     // Forward to WebSocket server
        //     const ws = new WebSocket(serverWsUrl);
        //     ws.onopen = () => {
        //         ws.send(JSON.stringify({
        //             type: 'LOCATION_UPDATE',
        //             driverId,
        //             lat: data.latitude,
        //             lon: data.longitude,
        //         }));
        //     };
        // });
    }
}

/**
 * Example 5: Database-based GPS History
 *
 * Read GPS history from a database and stream it
 */
export async function streamGPSHistory(
    serverWsUrl: string,
    databaseQuery: () => Promise<Array<{ driverId: string; lat: number; lon: number }>>
): Promise<void> {
    const ws = new WebSocket(serverWsUrl);

    ws.onopen = async () => {
        const locations = await databaseQuery();

        locations.forEach((location) => {
            ws.send(
                JSON.stringify({
                    type: 'LOCATION_UPDATE',
                    driverId: location.driverId,
                    lat: location.lat,
                    lon: location.lon,
                })
            );
        });
    };
}

/**
 * Summary of Integration Methods:
 *
 * 1. Direct WebSocket: Mobile app sends directly to server
 *    - Fastest, lowest latency
 *    - Requires mobile app SDK integration
 *
 * 2. API Polling: Backend polls mobile/GPS API periodically
 *    - Simple to implement
 *    - More latency than direct WebSocket
 *
 * 3. MQTT/Message Queue: GPS devices publish to message broker
 *    - Scalable for many devices
 *    - Decouples GPS collection from tracking
 *
 * 4. Webhooks: Mobile backend sends data via HTTP webhooks
 *    - Simple server-to-server communication
 *    - Requires webhook handling on your server
 *
 * 5. Database: Read locations from database
 *    - Good for replaying historical data
 *    - Can simulate different scenarios
 */
