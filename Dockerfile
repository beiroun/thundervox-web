# syntax=docker/dockerfile:1
# SPDX-License-Identifier: BUSL-1.1
# Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
#
# ThunderVox Web image: the SPA is built with Node, served by nginx together with the /api proxy to the server.
# Published as ghcr.io/beiroun/thundervox-web:<version> by CI on a tagged release.

ARG APP_VERSION=0.0.0-dev
# Only for a console served from a different name than its API; empty keeps the bundle same-origin. Compiled
# into the JavaScript by vite, which is why it is a build argument and not a runtime environment variable.
ARG API_BASE_URL=""

FROM node:24-trixie-slim AS build
ARG APP_VERSION
ARG API_BASE_URL
WORKDIR /workspace

# Dependencies are a separate layer: a source change does not re-download node_modules
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
ENV VITE_APP_VERSION=${APP_VERSION}
ENV VITE_API_BASE_URL=${API_BASE_URL}
RUN npm run build

FROM nginx:1.30-trixie
ARG APP_VERSION
LABEL org.opencontainers.image.title="ThunderVox Web" \
      org.opencontainers.image.description="Operator console of the ThunderVox SIP endpoint platform" \
      org.opencontainers.image.source="https://github.com/beiroun/thundervox-web" \
      org.opencontainers.image.licenses="BUSL-1.1" \
      org.opencontainers.image.version="${APP_VERSION}"

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html

# Host-networked in the compose deployment, reached by the edge proxy over loopback; informational
EXPOSE 8081
