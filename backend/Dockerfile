# Dockerfile cho backend
FROM python:3.11

# Cài đặt các công cụ và thư viện cần thiết cho GDAL
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    gcc \
    python3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Thiết lập biến môi trường để biên dịch GDAL Python binding
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt Python dependencies từ requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kiểm tra và cài đặt GDAL Python binding khớp với phiên bản hệ thống
RUN GDAL_VERSION=$(gdalinfo --version | cut -d ' ' -f 2 | cut -d ',' -f 1) && \
    if [ -z "$GDAL_VERSION" ]; then echo "Error: Could not determine GDAL version"; exit 1; fi && \
    pip install --no-cache-dir GDAL=="$GDAL_VERSION"

# Sao chép mã nguồn
COPY . .

# Mở port
EXPOSE 8003

# Chạy lệnh (sẽ được ghi đè bởi docker-compose.yml)
CMD ["gunicorn", "--bind", "0.0.0.0:8003", "branch_map.wsgi:application"]