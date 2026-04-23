#!/bin/bash
set -e

OSRM_DIR="/home/user/osrm-data"
MAP_FILE="$OSRM_DIR/map.osrm"
PBF_FILE="$OSRM_DIR/map.osm.pbf"

echo "RouteWave starting..."
echo "  Backend port: ${PORT:-7860}"
echo "  OSRM port: 5001"

if [ ! -f "$MAP_FILE" ]; then
  echo "OSRM data not found, downloading and preprocessing Luxembourg map..."
  mkdir -p "$OSRM_DIR"

  echo "Downloading map data..."
  wget -q "https://download.geofabrik.de/europe/luxembourg-latest.osm.pbf" -O "$PBF_FILE"

  echo "Running osrm-extract..."
  osrm-extract -p /opt/car.lua "$PBF_FILE"

  echo "Running osrm-partition..."
  osrm-partition "$OSRM_DIR/map.osrm"

  echo "Running osrm-customize..."
  osrm-customize "$OSRM_DIR/map.osrm"

  rm -f "$PBF_FILE"
  echo "OSRM preprocessing complete"
else
  echo "OSRM data found at $MAP_FILE"
fi

exec supervisord -c /etc/supervisord.conf
