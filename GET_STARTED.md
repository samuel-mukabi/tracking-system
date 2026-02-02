# 🚀 Step-by-Step: See Drivers on Your Map

## Option A: Quick Start (Single Command)

**Run this one command from the root folder:**

```bash
npm run dev:all
```

Then go to: **http://localhost:3000**

That's it! You'll see 3 drivers moving on the map. ✨

---

## Option B: Manual Start (Better for Debugging)

### Step 1️⃣: Open Terminal and Start the Server

```bash
cd server
npm run dev
```

**Expected Output:**
```
Server running on ws://localhost:8080
```

✅ Server is running and waiting for connections

---

### Step 2️⃣: Open a NEW Terminal and Start the Simulator

```bash
cd server
npm run simulate
```

**Expected Output:**
```
✓ Connected to server at ws://localhost:8080
✓ Started simulating 3 drivers

=== Driver Simulator Status ===
Connection: ✓ Connected
Drivers: 3

Driver Positions:
  driver_01: (-1.2921, 36.8219) - Speed: 42.5 km/h
  driver_02: (-1.3159, 36.7833) - Speed: 51.2 km/h
  driver_03: (-1.2857, 36.8216) - Speed: 38.9 km/h
===============================
```

✅ Simulator is running and sending GPS data to the server

---

### Step 3️⃣: Open a THIRD Terminal and Start the Frontend

```bash
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 16.1.6
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 1234ms
```

✅ Frontend is ready

---

### Step 4️⃣: Open Your Browser

**Go to:** http://localhost:3000

You should see:
- 📍 **A map of Nairobi, Kenya**
- 🚗 **3 colored markers moving in real-time**
- 📌 **Each marker shows the driver ID when you click it**

🎉 **SUCCESS! Drivers are now visible on your map!**

---

## 📱 What's Happening Behind the Scenes

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR BROWSER                            │
│          http://localhost:3000 (Next.js Frontend)           │
│                    Shows Map with 3 Markers                 │
└────────────────────┬──────────────────────────────────────┘
                     │ WebSocket Connection
                     │ (ws://localhost:8080)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               WebSocket Server (Port 8080)                  │
│            Receives location updates & broadcasts            │
│           them to all connected clients                      │
└────────────────┬──────────────────────────────────────────┘
                 │ Receives data every 2 seconds
                 ▼
┌─────────────────────────────────────────────────────────────┐
│           Driver Location Simulator                         │
│      Simulates GPS movement for 3 drivers:                  │
│      - driver_01 (Nairobi CBD)                              │
│      - driver_02 (Westlands)                                │
│      - driver_03 (Karen)                                    │
│                                                             │
│      Sends LOCATION_UPDATE messages via WebSocket           │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist

Before you start, make sure you have:

- [ ] Node.js installed (`node --version`)
- [ ] All dependencies installed (`npm install` in root and `cd server && npm install`)
- [ ] Port 3000 is free (frontend)
- [ ] Port 8080 is free (WebSocket server)

To check if ports are in use:
```bash
# Check port 3000
lsof -i :3000

# Check port 8080
lsof -i :8080
```

If a port is in use, kill it with:
```bash
kill -9 <PID>
```

---

## 🎮 Want to Control the Drivers Manually?

Instead of auto-simulator, you can send GPS data manually:

```bash
cd server
npm run test-client
```

Then follow the interactive menu:
```
=== GPS Test Client Menu ===
1. Send location update
2. Send batch locations
3. Simulate route
4. Quick test (3 drivers)
5. Exit
============================
```

Select option 4 for a quick demo with 3 drivers!

---

## 🚨 Problems?

### "Connection refused" or "Cannot find ws://localhost:8080"?
- ❌ Server not running
- ✅ Run `cd server && npm run dev` first

### "No markers on map"?
- ❌ Simulator not running
- ✅ Run `cd server && npm run simulate` in second terminal

### "Map won't load"?
- ❌ Frontend error
- ✅ Check browser console (F12)
- ✅ Try http://localhost:3000 explicitly

### "Updates are slow"?
- ✅ Normal - updates happen every 2 seconds
- ✅ To make faster: Edit `/server/driver-simulator.ts` line 26

---

## 🎯 Success Indicators

You'll know it's working when you see:

1. ✅ **Server terminal**: "Server running on ws://localhost:8080"
2. ✅ **Simulator terminal**: "Connected to server" + driver positions
3. ✅ **Frontend terminal**: "Ready in XXXms"
4. ✅ **Browser**: Map loads with 3 moving markers
5. ✅ **Browser console** (F12): No red errors

---

## 📖 Next: Customize Your Setup

Once you see the map working:

1. **Change map center**: Edit `DriverMap.tsx` line 82
2. **Add more drivers**: Edit `driver-simulator.ts` line 19-23
3. **Change update speed**: Edit `driver-simulator.ts` line 26
4. **Customize driver routes**: Edit DRIVER_ROUTES in `driver-simulator.ts`
5. **Connect real GPS**: See `gps-data-providers.example.ts`

---

**You're all set! Happy tracking! 🚗📍**
