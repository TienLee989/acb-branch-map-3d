from django.contrib.gis.db import models

class Branch(models.Model):
    id = models.CharField(max_length=64, primary_key=True)  # TEXT PRIMARY KEY
    name = models.CharField(max_length=255)
    operator = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=10, blank=True, null=True)  # 'PGD' or 'HO'
    category = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    time = models.CharField(max_length=100, blank=True, null=True)
    tags = models.JSONField(blank=True, null=True)
    image = models.TextField(blank=True, null=True)
    icon = models.TextField(blank=True, null=True)
    geom = models.GeometryField(srid=4326)
    embedding = models.TextField(blank=True, null=True)  # Lưu JSON string (list 384 or 1536 chiều)

    class Meta:
        db_table = 'gis_branchs'

    def __str__(self):
        return f"Branch {self.id} - {self.name or 'Unnamed'}"
