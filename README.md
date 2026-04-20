---
title: RouteWave
emoji: 🌊
colorFrom: blue
colorTo: cyan
sdk: docker
app_port: 7860
pinned: true
---

# 🌊 RouteWave

> **Visual bidirectional pathfinding** — watch the algorithm think, not just the result.

RouteWave is a premium routing visualization tool. Select two road points on the map and watch **two glowing waves** grow from both ends simultaneously, meeting in the middle to reveal the optimal route.

## Features

- 🌊 **Bidirectional wave animation** — blue from start, cyan from end
- 🗺️ **Real road routing** via OSRM (Luxembourg region pre-loaded)
- 🌐 **Border crossing detection** — automatic international route badge
- 🔄 **Swap start/end** — re-routes instantly
- ⌨️ **Keyboard shortcuts** — `Esc` to reset, `Ctrl+S` to swap
- 📱 **Mobile responsive**

## Usage

1. Click anywhere on the map → sets **start point** (green)
2. Click a second location → sets **end point** (red) + computes route
3. Watch the bidirectional waves animate along the route
4. Stats (distance, duration) appear on completion
5. Click a 3rd time or press `Esc` to reset

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + Leaflet |
| Backend | Node.js + Express + TypeScript |
| Routing | OSRM (Open Source Routing Machine) |
| Map Tiles | CartoDB Dark Matter |
| Deployment | HF Spaces (Docker) |

## Map Coverage

This deployment uses the **Luxembourg** OSM extract (~7MB) processed during build.
This covers Luxembourg + nearby France/Belgium/Germany border regions — perfect for demonstrating cross-border routing.

## API

```
POST /api/route
Content-Type: application/json

{
  "start": [49.6116, 6.1319],
  "end": [50.8503, 4.3517]
}
```

Response:
```json
{
  "geometry": [[lat, lng], ...],
  "distance": 187432,
  "duration": 6843,
  "crossesBorder": true,
  "countries": ["LU", "BE"]
}
```
