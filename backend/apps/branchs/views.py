from rest_framework import viewsets
from django.contrib.gis.geos import GEOSGeometry
from .models import *
from .serializers import *

# class BranchViewSet(viewsets.ModelViewSet):
#     vietnam_polygon = GEOSGeometry(
#         'POLYGON((102.1445 8.1791, 102.1445 23.3934, 109.4642 23.3934, 109.4642 8.1791, 102.1445 8.1791))',
#         srid=4326
#     )
#     queryset = Branch.objects.filter(geom__within=vietnam_polygon)
#     serializer_class = BranchSerializer
class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

# class BuildingViewSet(viewsets.ModelViewSet):
#     queryset = Building.objects.all()
#     serializer_class = BuildingSerializer

#     def list(self, request, *args, **kwargs):
#         return super().list(request, *args, **kwargs)
class BuildingViewSet(viewsets.ModelViewSet):
    vietnam_polygon = GEOSGeometry(
        'POLYGON((102.1445 8.1791, 102.1445 23.3934, 109.4642 23.3934, 109.4642 8.1791, 102.1445 8.1791))',
        srid=4326
    )

    queryset = Building.objects.filter(footprint__within=vietnam_polygon)
    serializer_class = BuildingSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class TrainingViewSet(viewsets.ModelViewSet):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class EmployeeTrainingViewSet(viewsets.ModelViewSet):
    queryset = EmployeeTraining.objects.select_related('employee', 'training')
    serializer_class = EmployeeTrainingSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
