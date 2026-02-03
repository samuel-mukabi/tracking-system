'use client'

import {useEffect, useState} from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

function DriverMarker({ id, lat, lon }: { id: string; lat: number; lon: number }) {
    return (
        <Marker position={[lat, lon]}>
            <Popup>Driver {id}</Popup>
        </Marker>
    );
}

const DriverMap = () => {
    const [drivers, setDrivers] = useState<{ [driverId: string]: { lat: number; lon: number}}>({})

    useEffect(() => {
        let socket: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout | undefined;

        const connect = () => {
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
            // Use wss:// for production HTTPS, ws:// for local development
            const protocol = wsUrl.startsWith('ws://') ? wsUrl : wsUrl.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
            socket = new WebSocket(protocol);

            socket.onopen = () => {
                console.log('Front-end connected to server');
                // SUBSCRIBE TO ALL 100 DRIVERS
                if (socket) {
                    for (let i = 1; i <= 100; i++) {
                        const driverId = `driver_${String(i).padStart(3, '0')}`;
                        socket!.send(JSON.stringify({ type: 'SUBSCRIBE_DRIVER', driverId }));
                    }
                }
            };

            socket.onmessage = (msg) => {
                try {
                    const data = JSON.parse(msg.data) as {
                        type: string;
                        driverId?: string;
                        lat?: number;
                        lon?: number;
                    };
                    if (data.type === 'DRIVER_LOCATION' && data.lat !== null && data.lon !== null && data.driverId) {
                        const driverId = data.driverId;
                        setDrivers((prev) => ({
                            ...prev,
                            [driverId]: { lat: data.lat || 0, lon: data.lon || 0 },
                        }));
                    }
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            };

            socket.onerror = () => {
                console.error('WebSocket error occurred');
            };

            socket.onclose = () => {
                console.log('Front-end disconnected, reconnecting in 1s...');
                reconnectTimeout = setTimeout(connect, 1000);
            };
        };

        connect();

        return () => {
            if (socket) socket.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, [])

    return (
        <MapContainer center={[0.0236, 37.9062]} zoom={7} style={{ height: "100vh", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            {Object.entries(drivers).map(([id, coords]) => (
                <DriverMarker key={id} id={id} lat={coords.lat} lon={coords.lon} />
            ))}
        </MapContainer>
    );
};
export default DriverMap;