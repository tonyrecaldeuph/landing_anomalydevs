FROM node:20-alpine
WORKDIR /app
COPY server/ ./server/
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server/index.mjs"]
