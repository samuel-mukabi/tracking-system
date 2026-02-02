# 🚗 Quick Start Guide - View Drivers on Map

## ⚡ Fastest Way (One Command)

If you have `concurrently` installed, run this from the root directory:

```bash
npm run dev:all
```

This starts everything at once:
- ✅ Frontend (Next.js) on http://localhost:3000
- ✅ WebSocket Server on ws://localhost:8080
- ✅ Driver Simulator sending location data

Then open your browser to **http://localhost:3000** and you'll see drivers moving on the map!

---

## 📋 Manual Way (Recommended for Debugging)

Open **3 separate terminals** and run these commands in order:

### Terminal 1: Start the WebSocket Server
```bash
cd server
npm run dev
```

You should see:
```
Server running on ws://localhost:8080
```

### Terminal 2: Start the Driver Simulator
```bash
cd server
npm run simulate
```

You should see:
```
✓ Connected to server at ws://localhost:8080
✓ Started simulating 3 drivers
```

### Terminal 3: Start the Frontend
```bash
npm run dev
```

You should see:
```
  ▲ Next.js 16.1.6
  - Local:        http://localhost:3000
```

### 4. Open Browser
Visit: **http://localhost:3000**

You should see a map with **3 driver markers** moving in real-time! 🎉

---

## 🔍 What You Should See

1. **Map centered on Nairobi, Kenya** (latitude: -1.2921, longitude: 36.8219)
2. **3 colored markers** labeled:
   - Driver 1 - Nairobi CBD
   - Driver 2 - Westlands  
   - Driver 3 - Karen
3. **Markers moving smoothly** every 2 seconds
4. **Click any marker** to see the driver ID in a popup

---

## 🐛 Troubleshooting

### Markers Not Appearing?
1. ✅ Check server is running (Terminal 1): Look for "Server running on ws://localhost:8080"
2. ✅ Check simulator is running (Terminal 2): Look for "Connected to server"
3. ✅ Open browser console (F12): Look for any red errors
4. ✅ Try refreshing the page: Ctrl+R or Cmd+R

### Connection Errors?
1. Make sure port 8080 is not in use: `lsof -i :8080`
2. Try killing any existing processes: `kill -9 <PID>`
3. Restart the server and simulator

### Slow Updates?
- This is normal - updates happen every 2 seconds
- You can change this in `/server/driver-simulator.ts` line 26:
  ```typescript
  const SIMULATION_INTERVAL = 2000; // Change to 1000 for faster
  ```

---

## 🎮 Test Manually (Optional)

If you want to send GPS data manually instead of auto-simulating:

```bash
cd server
npm run test-client
```

Then follow the interactive menu to send custom locations.

---

## 📊 Current Setup

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | http://localhost:3000 | Next.js |
| WebSocket Server | ws://localhost:8080 | Node.js |
| Driver Simulator | - | Sending data every 2 seconds |
| Drivers Tracked | 3 (driver_01, driver_02, driver_03) | Moving in Nairobi area |

---

## 🚀 Next Steps After Seeing It Work

1. **Customize driver routes** - Edit `/server/driver-simulator.ts` line 19-23
2. **Change map location** - Edit `/app/components/DriverMap.tsx` line 82
3. **Add more drivers** - Add entries to DRIVER_ROUTES object
4. **Connect real GPS** - See `/server/gps-data-providers.example.ts`
5. **Style the markers** - Customize Marker component in `/app/components/DriverMap.tsx`

---

## 💡 Tips

- **Speed up updates**: Change `SIMULATION_INTERVAL` from 2000 to 1000 ms
- **Add more drivers**: Just add more entries to `DRIVER_ROUTES`
- **Track all drivers**: Edit DriverMap.tsx to subscribe to multiple drivers (currently only tracks driver_01)
- **See status**: Every 30 seconds, the simulator prints driver positions

Enjoy! 🎉
