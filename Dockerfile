FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN mkdir -p /data
EXPOSE 5173 3001
CMD ["sh", "-c", "node server/index.cjs & npm run dev -- --host"]
