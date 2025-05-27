import random
import json
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Polygon
# from sentence_transformers import SentenceTransformer
from apps.branchs.models import Branch  # đúng model name


class Command(BaseCommand):
    help = 'Tạo ngẫu nhiên 10 trụ sở ngân hàng ACB tại TP.HCM vào gis_branchs'

    def handle(self, *args, **kwargs):
        # Tải mô hình embedding
        # model = SentenceTransformer('all-MiniLM-L6-v2')

        # Xoá dữ liệu cũ của ACB (trụ sở)
        Branch.objects.filter(operator='ACB', type='HO').delete()

        # Danh sách tên trụ sở giả lập
        names = [
            "Trụ sở ACB Nguyễn Thị Minh Khai",
            "Trụ sở ACB Lê Văn Sỹ",
            "Trụ sở ACB Nguyễn Trãi",
            "Trụ sở ACB Cách Mạng Tháng 8",
            "Trụ sở ACB Hai Bà Trưng",
            "Trụ sở ACB Điện Biên Phủ",
            "Trụ sở ACB Quang Trung",
            "Trụ sở ACB Lý Thường Kiệt",
            "Trụ sở ACB Trường Chinh",
            "Trụ sở ACB Phan Xích Long"
        ]

        for i in range(10):
            name = names[i]
            lon = 106.7 + random.uniform(-0.01, 0.01)
            lat = 10.77 + random.uniform(-0.01, 0.01)
            address = f"{random.randint(100, 999)} Đường {name.split()[-1]}, Q.{random.randint(1, 12)}, TP.HCM"

            # Tạo polygon toà nhà giả định
            poly = Polygon((
                (lon, lat),
                (lon + 0.0002, lat),
                (lon + 0.0002, lat + 0.0002),
                (lon, lat + 0.0002),
                (lon, lat)
            ), srid=4326)

            # Sinh embedding
            text = f"{name}. {address}. Ngân hàng ACB, hỗ trợ doanh nghiệp và cá nhân, phòng VIP."
            # embedding = json.dumps(model.encode(text).tolist())  # lưu dưới dạng chuỗi JSON
            embedding = text #json.dumps(text.tolist())
            
            # Tạo bản ghi
            loc = Branch(
                id=f"acb-hq-{i}",
                name=name,
                operator="ACB",
                type="HO",
                category="headquarter",
                address=address,
                phone="028 3929 0999",
                email="info@acb.com.vn",
                website="https://acb.com.vn",
                time="Mon–Fri 08:00–17:00",
                tags={
                    "services": ["doanh nghiệp", "cá nhân", "phòng VIP"],
                    "has_atm": True,
                    "accessible": True
                },
                image="/images/default-branch.jpg",
                icon="/images/icon.avif",
                geom=poly,
                embedding=embedding
            )
            loc.save()
            self.stdout.write(self.style.SUCCESS(f'✔ Đã thêm: {name}'))

        self.stdout.write(self.style.SUCCESS('✅ Đã tạo 10 trụ sở ACB vào bảng gis_branchs.'))
