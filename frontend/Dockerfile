# Dockerfile cho frontend
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN npm run build || (echo "❌ BUILD FAILED " && exit 1)

RUN npm install -g serve

CMD ["serve", "-s", "build", "-l", "3000"]