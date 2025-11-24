#!/usr/bin/env bash
set -euo pipefail

# Production startup script for RCD stack (mongo, auth, app, web)
# Rebuilds images and launches containers on a shared network.
# Customize vars below as needed.

# ---- Configuration ----
JWT_SECRET="dev_super_secret_jwt"        # Override in secure environments
MONGO_IMAGE="mongo:6"
NETWORK_NAME="rcd-network"
MONGO_CONTAINER="rcd-mongo"
AUTH_CONTAINER="rcd-auth"
APP_CONTAINER="rcd-app"
WEB_CONTAINER="rcd-web"
MONGO_DB_NAME="rcd"
SEED_ADMIN="false"                      # Set to true if you want AUTO_CREATE_ADMIN
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Admin123!"
WEB_PORT_HOST=8080
AUTH_PORT_HOST=3002
APP_PORT_HOST=3001
MONGO_PORT_HOST=27017

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RCD_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

log() { printf "[startup] %s\n" "$*"; }

# ---- Docker Network ----
if ! docker network ls --format '{{.Name}}' | grep -q "^${NETWORK_NAME}$"; then
  log "Creating network ${NETWORK_NAME}";
  docker network create "${NETWORK_NAME}" >/dev/null
fi

# ---- Remove Existing Containers ----
for c in "$WEB_CONTAINER" "$AUTH_CONTAINER" "$APP_CONTAINER"; do
  if docker ps -a --format '{{.Names}}' | grep -q "^${c}$"; then
    log "Removing existing container ${c}";
    docker rm -f "${c}" >/dev/null || true
  fi
done
# Mongo optional removal if not already attached correctly
if docker ps -a --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER}$"; then
  log "Mongo container already exists; ensuring network attachment";
  docker network connect "${NETWORK_NAME}" "${MONGO_CONTAINER}" 2>/dev/null || true
else
  log "Starting fresh mongo container";
  docker run -d --name "${MONGO_CONTAINER}" --network "${NETWORK_NAME}" -p ${MONGO_PORT_HOST}:27017 "${MONGO_IMAGE}" --bind_ip_all >/dev/null
fi

# ---- Build Images ----
log "Building web image"
docker build -t rcd_web:latest -f "${RCD_ROOT}/Dockerfile.web" "${RCD_ROOT}" >/dev/null
log "Building auth image"
docker build -t rcd_auth:latest "${RCD_ROOT}/rcd-auth-server" >/dev/null
log "Building app image"
docker build -t rcd_app:latest "${RCD_ROOT}/rcd-app" >/dev/null

# ---- Run Auth ----
log "Starting auth service"
AUTO_CREATE_ADMIN_ENV="AUTO_CREATE_ADMIN=${SEED_ADMIN}";
if [ "${SEED_ADMIN}" = "true" ]; then
  ADMIN_VARS=(-e ADMIN_EMAIL="${ADMIN_EMAIL}" -e ADMIN_PASSWORD="${ADMIN_PASSWORD}")
else
  ADMIN_VARS=()
fi

docker run -d --name "${AUTH_CONTAINER}" --network "${NETWORK_NAME}" -p ${AUTH_PORT_HOST}:3002 \
  -e NODE_ENV=production -e PORT=3002 \
  -e MONGO_URI="mongodb://${MONGO_CONTAINER}:27017/${MONGO_DB_NAME}" \
  -e FRONTEND_ORIGIN="http://localhost:${WEB_PORT_HOST}" \
  -e JWT_SECRET="${JWT_SECRET}" -e USE_MEMORY_DB=false \
  -e ${AUTO_CREATE_ADMIN_ENV} \
  "${ADMIN_VARS[@]}" \
  rcd_auth:latest >/dev/null

# ---- Run App ----
log "Starting app service"
docker run -d --name "${APP_CONTAINER}" --network "${NETWORK_NAME}" -p ${APP_PORT_HOST}:3001 \
  -e NODE_ENV=production -e PORT=3001 \
  -e DB_URI="mongodb://${MONGO_CONTAINER}:27017/${MONGO_DB_NAME}" \
  -e FRONTEND_ORIGIN="http://localhost:${WEB_PORT_HOST}" \
  rcd_app:latest >/dev/null

# ---- Run Web (Next.js) ----
log "Starting web service"
docker run -d --name "${WEB_CONTAINER}" --network "${NETWORK_NAME}" -p ${WEB_PORT_HOST}:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL="http://${AUTH_CONTAINER}:3002" \
  -e AUTH_SERVICE_URL="http://${AUTH_CONTAINER}:3002" \
  -e MONGO_URI="mongodb://${MONGO_CONTAINER}:27017/${MONGO_DB_NAME}" \
  rcd_web:latest >/dev/null

# ---- Health Checks ----
log "Waiting for services to initialize..."
sleep 4

web_status=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:${WEB_PORT_HOST} || true)
auth_status=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:${AUTH_PORT_HOST}/api/auth/debug || true)
app_status=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:${APP_PORT_HOST}/health || true)

log "Web HTTP ${web_status}";
log "Auth debug HTTP ${auth_status}";
log "App health HTTP ${app_status}";

if [ "$web_status" != 200 ] || [ "$auth_status" != 200 ] || [ "$app_status" != 200 ]; then
  log "One or more services failed health checks. Inspect logs:";
  log "docker logs ${WEB_CONTAINER} | docker logs ${AUTH_CONTAINER} | docker logs ${APP_CONTAINER}";
  exit 1
fi

log "All services healthy. Production stack is up."

# Optional test: register a quick user (disabled by default)
# curl -s -X POST http://localhost:${AUTH_PORT_HOST}/api/auth/register \
#   -H 'Content-Type: application/json' \
#   -d '{"email":"user@example.com","password":"TestPass123!","username":"user1"}'

exit 0
