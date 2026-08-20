FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# SQLite database stored in a persistent volume at /data
ENV DB_PATH=/data/database.sqlite
EXPOSE 8080
CMD ["node", "server.js"]
