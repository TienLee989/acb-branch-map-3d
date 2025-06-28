-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- ENUM definitions
CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE employee_status_enum AS ENUM ('Active', 'Inactive', 'OnLeave', 'Resigned');
CREATE TYPE contract_type_enum AS ENUM ('Fulltime', 'Parttime', 'Contract');
CREATE TYPE leave_status_enum AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE event_type_enum AS ENUM ('Reward', 'Discipline');

-- Branches
CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  address TEXT,
  established_date DATE
);

-- Buildings
CREATE TABLE buildings (
  id SERIAL PRIMARY KEY,
  branch_id INT REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  address TEXT,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  footprint geometry(POLYGON, 4326),
  floor_count INT DEFAULT 1,
  floor_height_m DECIMAL(5,2) DEFAULT 3.0,
  total_height_m DECIMAL(6,2),
  area_m2 DECIMAL(8,2),
  color_code VARCHAR,
  manager_name VARCHAR,
  image_url VARCHAR,
  model_3d_url VARCHAR,
  texture_url VARCHAR
);

CREATE INDEX idx_buildings_footprint ON buildings USING GIST (footprint);

-- Departments
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT
);

-- Rooms
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  building_id INT REFERENCES buildings(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  floor INT,
  area_m2 DECIMAL(6,2),
  usage_type VARCHAR,
  department_id INT REFERENCES departments(id) ON DELETE SET NULL
);

CREATE INDEX idx_rooms_building ON rooms(building_id);

-- Positions
CREATE TABLE positions (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  level VARCHAR,
  base_salary DECIMAL
);

-- Employees
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR NOT NULL,
  gender gender_enum,
  dob DATE,
  phone VARCHAR,
  email VARCHAR UNIQUE,
  department_id INT REFERENCES departments(id) ON DELETE SET NULL,
  position_id INT REFERENCES positions(id) ON DELETE SET NULL,
  room_id INT REFERENCES rooms(id) ON DELETE SET NULL,
  floor_number INT,
  room_code VARCHAR,
  hire_date DATE,
  status employee_status_enum DEFAULT 'Active',
  avatar_url VARCHAR,
  location_vector VECTOR(358)
);

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_vector ON employees USING ivfflat (location_vector vector_cosine_ops) WITH (lists = 100);

-- Contracts
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL,
    type contract_type_enum,
    start_date DATE NOT NULL,
    end_date DATE,
    salary DECIMAL(10, 2) NOT NULL,
    status employee_status_enum,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Payroll
CREATE TABLE payroll (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  year_month VARCHAR NOT NULL,
  salary_total DECIMAL,
  bonus DECIMAL,
  deductions DECIMAL
);

-- Leaves
CREATE TABLE leaves (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  type VARCHAR,
  from_date DATE,
  to_date DATE,
  reason TEXT,
  status leave_status_enum
);

-- Trainings
CREATE TABLE trainings (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  date_range VARCHAR
);

-- Employee_Trainings
CREATE TABLE employee_trainings (
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  training_id INT REFERENCES trainings(id) ON DELETE CASCADE,
  result VARCHAR,
  PRIMARY KEY (employee_id, training_id)
);

-- Evaluations
CREATE TABLE evaluations (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  evaluation_period VARCHAR NOT NULL,
  attendance_score DECIMAL,
  reward_score DECIMAL,
  discipline_score DECIMAL,
  training_score DECIMAL,
  performance_score DECIMAL,
  total_score DECIMAL,
  rank_in_department INT,
  rank_in_company INT,
  vector_summary VECTOR(358),
  last_updated TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_eval_vector ON evaluations USING ivfflat (vector_summary vector_cosine_ops) WITH (lists = 100);

-- Events
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  type event_type_enum,
  title VARCHAR,
  content TEXT,
  event_date DATE,
  summary_vector VECTOR(358)
);

CREATE INDEX idx_event_vector ON events USING ivfflat (summary_vector vector_cosine_ops) WITH (lists = 100);

-- ENUM in English for attendance status
CREATE TYPE attendance_status AS ENUM ('Present', 'Late', 'Absent');

-- Attendance table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance_status NOT NULL,
    time_in TIME,
    time_out TIME,
    hours_worked DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional index for performance
CREATE INDEX idx_attendance_employee_date ON attendance (employee_id, date);
