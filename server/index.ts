// server/index.ts
import WebSocket, { WebSocketServer } from 'ws'

const PORT = 8080
const wss = new WebSocketServer({ port: PORT })
console.log(`Server running on ws://localhost:${PORT}`)

const subscriptions: Record<string, WebSocket[]> = {}
const driverPositions: Record<string, { lat: number; lon: number }> = {}

type IncomingMessage = {
    type: string
    driverId?: string
    lat?: number
    lon?: number
}

wss.on('connection', (ws) => {
    console.log('Client connected')

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString()) as IncomingMessage

            // HANDLE DRIVER LOCATION UPDATES
            if (
                data.type === 'LOCATION_UPDATE' &&
                typeof data.driverId === 'string' &&
                typeof data.lat === 'number' &&
                typeof data.lon === 'number'
            ) {
                const driverId = data.driverId
                driverPositions[driverId] = { lat: data.lat, lon: data.lon }

                const subs = subscriptions[driverId] ?? []
                subs.forEach((sub) => {
                    if (sub.readyState === WebSocket.OPEN) {
                        sub.send(
                            JSON.stringify({
                                type: 'DRIVER_LOCATION',
                                driverId,
                                lat: data.lat,
                                lon: data.lon,
                            })
                        )
                    }
                })
            }

            // HANDLE SUBSCRIPTION REQUESTS FROM CLIENTS
            if (data.type === 'SUBSCRIBE_DRIVER' && typeof data.driverId === 'string') {
                const driverId = data.driverId;

                let subs = subscriptions[driverId];
                if (!subs) {
                    subs = [];
                    subscriptions[driverId] = subs;
                }
                if (!subs.includes(ws)) {
                    subs.push(ws);
                }

                const pos = driverPositions[driverId];
                if (pos && ws.readyState === WebSocket.OPEN) {
                    ws.send(
                        JSON.stringify({
                            type: 'DRIVER_LOCATION',
                            driverId,
                            lat: pos.lat,
                            lon: pos.lon,
                        })
                    );
                }
            }
        } catch (e) {
            console.error('Invalid message received: ', message.toString(), e)
        }
    })

    ws.on('close', () => {
        console.log('Client disconnected')

        Object.values(subscriptions).forEach((subs) => {
            const idx = subs.indexOf(ws)
            if (idx !== -1) subs.splice(idx, 1)
        })
    })
})