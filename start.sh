#!/bin/bash
set -e

echo " RouteWave starting..."
echo "   OSRM data: /data/map.osrm"
echo "   Backend port: ${PORT:-7860}"
echo "   OSRM port: 5001"

# Ensure OSRM data exists
if [ ! -f "/data/map.osrm" ]; then
  echo "ERROR: OSRM data not found at /data/map.osrm"
  echo "   The Dockerfile should have preprocessed this during build."
  exit 1
fi

echo "OSRM data found"

# Start supervisord (manages OSRM + Express)
exec supervisord -c /etc/supervisor/conf.d/routewave.conf
