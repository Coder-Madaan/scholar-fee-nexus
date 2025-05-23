-- Create students table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  class VARCHAR(20) NOT NULL,
  roll_number VARCHAR(50) UNIQUE NOT NULL,
  parent_name VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fee_components table
CREATE TABLE fee_components (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  fee_component_id INTEGER REFERENCES fee_components(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'cheque', 'upi', 'bank_transfer')),
  payment_date DATE NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_fee_components_class ON fee_components(class);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_fee_component_id ON payments(fee_component_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_academic_year ON payments(academic_year);

-- Enable Row Level Security (RLS) if needed
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust as needed)
CREATE POLICY "Allow authenticated users to read students" ON students
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert students" ON students
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update students" ON students
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete students" ON students
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read fee_components" ON fee_components
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert fee_components" ON fee_components
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update fee_components" ON fee_components
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete fee_components" ON fee_components
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read payments" ON payments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert payments" ON payments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update payments" ON payments
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete payments" ON payments
  FOR DELETE TO authenticated USING (true);
