#Tổng quan về giải pháp
Backend: Sử dụng Django với Django REST Framework và GeoDjango để cung cấp API GeoJSON cho dữ liệu ATM từ PostGIS.
Frontend: Sử dụng ReactJS với MapLibre GL JS để render bản đồ 3D, hiển thị các địa điểm ATM.
Database: PostgreSQL với PostGIS để lưu trữ dữ liệu không gian (các điểm ATM).
Containerization: Sử dụng Docker Compose để triển khai các dịch vụ (db, backend, frontend) và không build trực tiếp trên host.
Hiệu suất: Tối ưu hóa truy vấn PostGIS, sử dụng index không gian, caching với Redis, và nén dữ liệu GeoJSON.
Dữ liệu Branch: Dữ liệu mẫu được nhập vào PostGIS (có thể thay thế bằng dữ liệu thực từ OSM hoặc nguồn khác).

branch-map-project/
├── backend/
│   ├── branch_map/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   ├── asgi.py
│   ├── apps/
│   │   ├── __init__.py
│   │   ├── branchs/
│   │   │   ├── __init__.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   ├── admin.py
│   │   │   ├── management/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── import_branchs.py
│   │   │   ├── migrations/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map.js
│   │   │   ├── Dashboard.js
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   ├── public/
│   │   ├── index.html
│   ├── package.json
│   ├── Dockerfile
├── docker-compose.yml
├── README.md

# Django
docker run --rm -v D:/document/master/GIS/branch-map/backend:/app -w /app python:3.11-slim bash -c "pip install django==4.2 && django-admin startproject branch_map ."
----------------
docker exec -it acb-branch-map-3d-db-1 psql -U admin -d GIS
SELECT * FROM branchs WHERE ST_Within(
    geom,
    ST_GeomFromText('POLYGON((106.6297 10.6958, 106.6297 10.8792, 106.8057 10.8792, 106.8057 10.6958, 106.6297 10.6958))', 4326)
);
------------------
touch /app/apps/branchs/__init__.py

docker-compose exec redis bash
redis-cli -n 1 FLUSHDB

docker-compose exec backend python manage.py import_branchs