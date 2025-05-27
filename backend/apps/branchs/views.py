from rest_framework import viewsets
from django.contrib.gis.geos import GEOSGeometry
from .models import Branch
from .serializers import BranchSerializer

class BranchViewSet(viewsets.ModelViewSet):
    # Bao phủ toàn lãnh thổ Việt Nam
    vietnam_polygon = GEOSGeometry(
        'POLYGON((102.1445 8.1791, 102.1445 23.3934, 109.4642 23.3934, 109.4642 8.1791, 102.1445 8.1791))',
        srid=4326
    )

    queryset = Branch.objects.filter(geom__within=vietnam_polygon)
    serializer_class = BranchSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
