# Dockerfile cho frontend
FROM node:18-alpine

WORKDIR /app

# Sao chép package.json và cài đặt phụ thuộc
COPY package.json ./
RUN npm install

# Sao chép mã nguồn
COPY . .

# Build dự án
RUN npm run build || (echo "❌ BUILD FAILED " && exit 1)

# Cài đặt serve để chạy ứng dụng
RUN npm install -g serve

# Chạy ứng dụng
CMD ["serve", "-s", "build", "-l", "3000"]