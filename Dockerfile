FROM node:22-alpine

LABEL org.opencontainers.image.title="CordFind MCP"
LABEL org.opencontainers.image.source="https://github.com/gokimedia/cordfind-mcp"
LABEL io.modelcontextprotocol.server.name="io.github.gokimedia/cordfind-generator-compatibility"

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --chown=node:node bin ./bin
COPY --chown=node:node README.md LICENSE server.json ./

USER node

ENTRYPOINT ["node", "bin/cordfind-mcp.mjs"]
