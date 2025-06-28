from rest_framework import serializers
from .models import (
    Attendance, Department, Position, Building, Room, Employee,
    Contract, Payroll, Leave, Training, EmployeeTraining,
    Evaluation, Event, Branch,Company
)

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'address', 'phone', 'email', 'website', 'start_time', 'end_time', 'created_at', 'updated_at']

class BranchSerializer(serializers.ModelSerializer):
    departments = serializers.SerializerMethodField()
    employees = serializers.SerializerMethodField()
    floors = serializers.SerializerMethodField()
    buildings = serializers.SerializerMethodField()
    rooms = serializers.SerializerMethodField()
    employees_detail = serializers.SerializerMethodField()
    departments_detail = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = '__all__'

    def get_departments(self, obj):
        departments = Employee.objects.filter(
            room__building__branch=obj
        ).values_list('department__name', flat=True).distinct()
        return ', '.join(filter(None, departments))

    def get_employees(self, obj):
        return Employee.objects.filter(
            room__building__branch=obj
        ).count()

    def get_floors(self, obj):
        return Employee.objects.filter(
            room__building__branch=obj
        ).values_list('floor_number', flat=True).distinct().count()

    def get_buildings(self, obj):
        buildings = Building.objects.filter(branch=obj)
        return BuildingSerializer(buildings, many=True).data

    def get_rooms(self, obj):
        rooms = Room.objects.filter(building__branch=obj)
        return RoomSerializer(rooms, many=True).data

    def get_employees_detail(self, obj):
        employees = Employee.objects.filter(room__building__branch=obj).select_related(
            'room', 'room__building', 'position', 'department'
        )
        return [
            {
                'id': emp.id,
                'name': emp.full_name,
                'position': emp.position.title if emp.position else None,
                'department': emp.department.name if emp.department else None,
                'room': emp.room.name if emp.room else None,
                'building': emp.room.building.name if emp.room and emp.room.building else None,
                'floor': emp.floor_number,
            }
            for emp in employees
        ]

    def get_departments_detail(self, obj):
        departments = Department.objects.all()
        result = []

        for dept in departments:
            employees = dept.employee_set.filter(room__building__branch=obj)
            if not employees.exists():
                continue
            rooms = employees.values_list('room__name', flat=True).distinct()
            result.append({
                'id': dept.id,
                'name': dept.name,
                'employee_count': employees.count(),
                'rooms': list(filter(None, set(rooms))),
            })

        return result

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = '__all__'

class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    position_title = serializers.CharField(source='position.title', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    branch_name = serializers.CharField(source='room.building.branch.name', read_only=True)  # assuming nested relations

    class Meta:
        model = Employee
        fields = '__all__'

class EmployeeShortSerializer(serializers.ModelSerializer):
    department = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Employee
        fields = ['id', 'full_name', 'department']

class ContractSerializer(serializers.ModelSerializer):
    employee = EmployeeShortSerializer(read_only=True)
    class Meta:
        model = Contract
        fields = '__all__'

class PayrollSerializer(serializers.ModelSerializer):
    employee = EmployeeShortSerializer(read_only=True)
    class Meta:
        model = Payroll
        fields = '__all__'

class LeaveSerializer(serializers.ModelSerializer):
    employee = EmployeeShortSerializer(read_only=True)
    class Meta:
        model = Leave
        fields = '__all__'

class TrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = '__all__'

class EmployeeTrainingSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    training = TrainingSerializer(read_only=True)

    class Meta:
        model = EmployeeTraining
        fields = ['id', 'employee', 'training', 'result']

class EvaluationSerializer(serializers.ModelSerializer):
    employee = EmployeeShortSerializer(read_only=True)
    class Meta:
        model = Evaluation
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    employee = EmployeeShortSerializer(read_only=True)
    class Meta:
        model = Event
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True, allow_null=True)
    branch_name = serializers.CharField(source='employee.room.building.branch.name', read_only=True, allow_null=True)
    employee = EmployeeShortSerializer(read_only=True)
    status_display = serializers.SerializerMethodField()
    company_start_time = serializers.SerializerMethodField()
    company_end_time = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'branch_name',
            'date', 'status', 'status_display', 'time_in', 'time_out',
            'company_start_time', 'company_end_time', 'hours_worked', 'note',
            'created_at', 'updated_at'
        ]

    def get_status_display(self, obj):
        status_map = {
            'Present': 'Đúng giờ',
            'Late': 'Trễ',
            'Absent': 'Nghỉ không phép'
        }
        return status_map.get(obj.status, obj.status)

    def get_company_start_time(self, obj):
        company = Company.objects.first()
        return company.start_time if company else None

    def get_company_end_time(self, obj):
        company = Company.objects.first()
        return company.end_time if company else None