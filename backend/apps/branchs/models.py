from django.contrib.gis.db import models
from django.utils import timezone

# class Branch(models.Model):
#     id = models.CharField(max_length=64, primary_key=True)  # TEXT PRIMARY KEY
#     name = models.CharField(max_length=255)
#     operator = models.CharField(max_length=255, blank=True, null=True)
#     type = models.CharField(max_length=10, blank=True, null=True)  # 'PGD' or 'HO'
#     category = models.CharField(max_length=100, blank=True, null=True)
#     address = models.TextField(blank=True, null=True)
#     phone = models.CharField(max_length=50, blank=True, null=True)
#     email = models.EmailField(blank=True, null=True)
#     website = models.URLField(blank=True, null=True)
#     time = models.CharField(max_length=100, blank=True, null=True)
#     tags = models.JSONField(blank=True, null=True)
#     image = models.TextField(blank=True, null=True)
#     icon = models.TextField(blank=True, null=True)
#     geom = models.GeometryField(srid=4326)
#     embedding = models.TextField(blank=True, null=True)  # Lưu JSON string (list 384 or 1536 chiều)

#     class Meta:
#         db_table = 'gis_branchs'

#     def __str__(self):
#         return f"Branch {self.id} - {self.name or 'Unnamed'}"

class Branch(models.Model):
    id = models.AutoField(primary_key=True)  # INT PRIMARY KEY (tự tăng)
    name = models.CharField(max_length=255)
    address = models.TextField()
    established_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'branches'

    def __str__(self):
        return f"Branch {self.id} - {self.name}"

class Department(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'departments'
        verbose_name = 'Phòng ban'
        verbose_name_plural = 'Các phòng ban'

class Position(models.Model):
    title = models.CharField(max_length=255)
    level = models.CharField(max_length=100)
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'positions'
        verbose_name = 'Vị trí'
        verbose_name_plural = 'Các vị trí'

class Building(models.Model):
    branch = models.ForeignKey('Branch', on_delete=models.CASCADE, related_name='buildings') 
    name = models.CharField(max_length=255)
    address = models.TextField()
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    footprint = models.PolygonField(srid=4326)
    floor_count = models.IntegerField()
    floor_height_m = models.DecimalField(max_digits=6, decimal_places=2)
    total_height_m = models.DecimalField(max_digits=6, decimal_places=2)
    area_m2 = models.DecimalField(max_digits=12, decimal_places=2)
    color_code = models.CharField(max_length=20)
    manager_name = models.CharField(max_length=255)
    image_url = models.URLField(blank=True, null=True)
    model_3d_url = models.URLField(blank=True, null=True)
    texture_url = models.URLField(blank=True, null=True)

    class Meta:
        db_table = 'buildings'
        verbose_name = 'Tòa nhà'
        verbose_name_plural = 'Các tòa nhà'

class Room(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='rooms')
    name = models.CharField(max_length=255)
    floor = models.IntegerField()
    area_m2 = models.DecimalField(max_digits=12, decimal_places=2)
    usage_type = models.CharField(max_length=255)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'rooms'
        verbose_name = 'Phòng'
        verbose_name_plural = 'Các phòng'

class Employee(models.Model):
    class Gender(models.TextChoices):
        MALE = 'Male'
        FEMALE = 'Female'
        OTHER = 'Other'

    class Status(models.TextChoices):
        ACTIVE = 'Active'
        INACTIVE = 'Inactive'
        ON_LEAVE = 'OnLeave'
        RESIGNED = 'Resigned'

    # full_name = models.CharField(max_length=255)
    # position = models.ForeignKey(Position, null=True, blank=True, on_delete=models.SET_NULL)
    # department = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL)
    # room = models.ForeignKey(Room, null=True, blank=True, on_delete=models.SET_NULL)
    # floor_number = models.IntegerField(default=1)

    full_name = models.CharField(max_length=255)
    gender = models.CharField(max_length=10, choices=Gender.choices)
    dob = models.DateField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, related_name='employees')
    floor_number = models.IntegerField()
    room_code = models.CharField(max_length=100)
    hire_date = models.DateField()
    status = models.CharField(max_length=10, choices=Status.choices)
    avatar_url = models.URLField(blank=True, null=True)
    location_vector = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'employees'
        verbose_name = 'Nhân viên'
        verbose_name_plural = 'Các nhân viên'

class Contract(models.Model):
    class Type(models.TextChoices):
        FULLTIME = 'Fulltime'
        PARTTIME = 'Parttime'
        CONTRACT = 'Contract'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=Type.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'contracts'
        verbose_name = 'Hợp đồng'
        verbose_name_plural = 'Các hợp đồng'

class Payroll(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    year_month = models.CharField(max_length=7)
    salary_total = models.DecimalField(max_digits=12, decimal_places=2)
    bonus = models.DecimalField(max_digits=12, decimal_places=2)
    deductions = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'payroll'
        verbose_name = 'Lương'
        verbose_name_plural = 'Bảng lương'

class Leave(models.Model):
    class Status(models.TextChoices):
        PENDING = 'Pending'
        APPROVED = 'Approved'
        REJECTED = 'Rejected'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    type = models.CharField(max_length=100)
    from_date = models.DateField()
    to_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices)

    class Meta:
        db_table = 'leaves'
        verbose_name = 'Đơn nghỉ'
        verbose_name_plural = 'Các đơn nghỉ'

class Training(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date_range = models.CharField(max_length=100)

    class Meta:
        db_table = 'trainings'
        verbose_name = 'Đào tạo'
        verbose_name_plural = 'Các khóa đào tạo'

class EmployeeTraining(models.Model):
    id = models.AutoField(primary_key=True)  # Thêm ID tự tăng

    employee = models.ForeignKey('Employee', on_delete=models.CASCADE)
    training = models.ForeignKey('Training', on_delete=models.CASCADE)
    result = models.CharField(max_length=100)
    class Meta:
        db_table = 'employee_trainings'
        verbose_name = 'Kết quả đào tạo'
        verbose_name_plural = 'Kết quả đào tạo của nhân viên'
        unique_together = ('employee', 'training')

class Evaluation(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    evaluation_period = models.CharField(max_length=20)
    attendance_score = models.DecimalField(max_digits=5, decimal_places=2)
    reward_score = models.DecimalField(max_digits=5, decimal_places=2)
    discipline_score = models.DecimalField(max_digits=5, decimal_places=2)
    training_score = models.DecimalField(max_digits=5, decimal_places=2)
    performance_score = models.DecimalField(max_digits=5, decimal_places=2)
    total_score = models.DecimalField(max_digits=5, decimal_places=2)
    rank_in_department = models.IntegerField()
    rank_in_company = models.IntegerField()
    vector_summary = models.TextField(blank=True, null=True)
    last_updated = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'evaluations'
        verbose_name = 'Đánh giá'
        verbose_name_plural = 'Các đánh giá'

class Event(models.Model):
    class Type(models.TextChoices):
        REWARD = 'Reward'
        DISCIPLINE = 'Discipline'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=Type.choices)
    title = models.CharField(max_length=255)
    content = models.TextField()
    event_date = models.DateField()
    summary_vector = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'events'
        verbose_name = 'Sự kiện'
        verbose_name_plural = 'Các sự kiện'
