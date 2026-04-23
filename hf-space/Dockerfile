FROM node:20-bookworm-slim AS backend-builder

WORKDIR /build/backend
COPY backend/package*.json ./
RUN npm ci --include=dev
COPY backend/ ./
RUN npm run build && ls -la dist/

FROM ghcr.io/project-osrm/osrm-backend:latest AS runtime

ENV TZ=UTC

RUN apk update && apk add --no-cache \
    curl wget ca-certificates supervisor nodejs npm bash

RUN adduser -D -u 1000 user
ENV HOME=/home/user PATH=/home/user/.local/bin:$PATH

RUN mkdir -p /home/user/osrm-data && chown user:user /home/user/osrm-data

WORKDIR $HOME/app

COPY --chown=user --from=backend-builder /build/backend/dist ./backend/dist
COPY --chown=user --from=backend-builder /build/backend/node_modules ./backend/node_modules

COPY --chown=user supervisord.conf /etc/supervisord.conf
COPY --chown=user start.sh ./start.sh
RUN chmod +x ./start.sh

USER user
EXPOSE 7860

ENV PORT=7860 \
    NODE_ENV=production \
    OSRM_URL=http://localhost:5001 \
    LOG_LEVEL=info

CMD ["./start.sh"]
