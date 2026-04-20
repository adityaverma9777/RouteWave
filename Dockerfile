
FROM node:20-bookworm-slim AS frontend-builder

WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci --prefer-offline
COPY frontend/ ./
RUN npm run build
FROM node:20-bookworm-slim AS backend-builder
WORKDIR /build/backend
COPY backend/package*.json ./
RUN npm ci --prefer-offline
COPY backend/ ./
RUN npm run build
FROM ubuntu:22.04 AS runtime
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget ca-certificates gnupg lsb-release \
    supervisor \
    
    libboost-filesystem1.74.0 \
    libboost-regex1.74.0 \
    libboost-iostreams1.74.0 \
    libboost-thread1.74.0 \
    libboost-date-time1.74.0 \
    libtbb12 \
    libluajit-5.1-2 \
    liblua5.2-0 \
    expat \
    
    wget \
  && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*
COPY --from=osrm/osrm-backend:latest /usr/local/bin/osrm-extract   /usr/local/bin/
COPY --from=osrm/osrm-backend:latest /usr/local/bin/osrm-partition  /usr/local/bin/
COPY --from=osrm/osrm-backend:latest /usr/local/bin/osrm-customize  /usr/local/bin/
COPY --from=osrm/osrm-backend:latest /usr/local/bin/osrm-routed     /usr/local/bin/
COPY --from=osrm/osrm-backend:latest /usr/local/lib/                /usr/local/lib/
RUN ldconfig
RUN useradd -m -u 1000 user
ENV HOME=/home/user PATH=/home/user/.local/bin:$PATH
RUN mkdir -p /data && chmod 777 /data
RUN wget -q "https://download.geofabrik.de/europe/luxembourg-latest.osm.pbf" \
      -O /data/map.osm.pbf \
  && osrm-extract -p /usr/local/share/osrm/profiles/car.lua /data/map.osm.pbf \
  && osrm-partition /data/map.osrm \
  && osrm-customize /data/map.osrm \
  && rm /data/map.osm.pbf \
  && echo "OSRM preprocessing complete"
WORKDIR $HOME/app
COPY --chown=user --from=backend-builder /build/backend/dist ./backend/dist
COPY --chown=user --from=backend-builder /build/backend/node_modules ./backend/node_modules
COPY --chown=user backend/data ./backend/data
COPY --chown=user --from=frontend-builder /build/frontend/dist ./frontend/dist
COPY --chown=user supervisord.conf /etc/supervisor/conf.d/routewave.conf
COPY --chown=user start.sh ./start.sh
RUN chmod +x ./start.sh
USER user
EXPOSE 7860
ENV PORT=7860 \
    NODE_ENV=production \
    OSRM_URL=http://localhost:5001 \
    LOG_LEVEL=info

CMD ["./start.sh"]
