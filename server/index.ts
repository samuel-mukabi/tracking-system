// server/index.ts
import WebSocket, { WebSocketServer, type RawData } from 'ws'

const PORT = parseInt(process.env.PORT || '8080', 10)
const wss = new WebSocketServer({ port: PORT })
console.log(`🚀 WebSocket Server running on port ${PORT}`)
console.log(`📡 Ready for driver location updates and client subscriptions`)

const subscriptions: Record<string, WebSocket[]> = {}
const driverPositions: Record<string, { lat: number; lon: number }> = {}

type IncomingMessage = {
    type: string
    driverId?: string
    lat?: number
    lon?: number
}

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected')

    ws.on('message', (message: RawData) => {
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