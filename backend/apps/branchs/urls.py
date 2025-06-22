from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BranchViewSet, DepartmentViewSet, PositionViewSet,
    BuildingViewSet, RoomViewSet, EmployeeViewSet,
    ContractViewSet, PayrollViewSet, LeaveViewSet,
    TrainingViewSet, EmployeeTrainingViewSet,
    EvaluationViewSet, EventViewSet
)

router = DefaultRouter()
router.register(r'branchs', BranchViewSet, basename='branchs')
router.register(r'departments', DepartmentViewSet, basename='departments')
router.register(r'positions', PositionViewSet, basename='positions')
router.register(r'buildings', BuildingViewSet, basename='buildings')
router.register(r'rooms', RoomViewSet, basename='rooms')
router.register(r'employees', EmployeeViewSet, basename='employees')
router.register(r'contracts', ContractViewSet, basename='contracts')
router.register(r'payroll', PayrollViewSet, basename='payroll')
router.register(r'leaves', LeaveViewSet, basename='leaves')
router.register(r'trainings', TrainingViewSet, basename='trainings')
router.register(r'employee-trainings', EmployeeTrainingViewSet, basename='employee-trainings')
router.register(r'evaluations', EvaluationViewSet, basename='evaluations')
router.register(r'events', EventViewSet, basename='events')

print("=== ROUTER REGISTERED URLs ===")
for url in router.urls:
    print(url.name, url.pattern)
    
urlpatterns = [
    path('', include(router.urls)),
]