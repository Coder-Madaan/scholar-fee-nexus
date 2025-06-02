
-- Create organizations table
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_organizations table to link users to their organizations
CREATE TABLE user_organizations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Add organization_id to existing tables
ALTER TABLE students ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE fee_components ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE payments ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_students_organization_id ON students(organization_id);
CREATE INDEX idx_fee_components_organization_id ON fee_components(organization_id);
CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);

-- Update RLS policies to be organization-aware
DROP POLICY IF EXISTS "Allow authenticated users to read students" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to insert students" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to update students" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to delete students" ON students;

DROP POLICY IF EXISTS "Allow authenticated users to read fee_components" ON fee_components;
DROP POLICY IF EXISTS "Allow authenticated users to insert fee_components" ON fee_components;
DROP POLICY IF EXISTS "Allow authenticated users to update fee_components" ON fee_components;
DROP POLICY IF EXISTS "Allow authenticated users to delete fee_components" ON fee_components;

DROP POLICY IF EXISTS "Allow authenticated users to read payments" ON payments;
DROP POLICY IF EXISTS "Allow authenticated users to insert payments" ON payments;
DROP POLICY IF EXISTS "Allow authenticated users to update payments" ON payments;
DROP POLICY IF EXISTS "Allow authenticated users to delete payments" ON payments;

-- Students policies
CREATE POLICY "Allow users to read their organization's students" ON students
  FOR SELECT TO authenticated USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to insert students in their organization" ON students
  FOR INSERT TO authenticated WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to update their organization's students" ON students
  FOR UPDATE TO authenticated USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to delete their organization's students" ON students
  FOR DELETE TO authenticated USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Fee components policies
CREATE POLICY "Allow users to read their organization's fee components" ON fee_components
  FOR SELECT TO authenticated USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to insert fee components in their organization" ON fee_components
  FOR INSERT TO authenticated WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to update their organization's fee components" ON fee_components
  FOR UPDATE TO authenticated USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to delete their organization's fee components" ON fee_components
  FOR DELETE TO authenticated USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Payments policies
CREATE POLICY "Allow users to read their organization's payments" ON payments
  FOR SELECT TO authenticated USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to insert payments in their organization" ON payments
  FOR INSERT TO authenticated WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to update their organization's payments" ON payments
  FOR UPDATE TO authenticated USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to delete their organization's payments" ON payments
  FOR DELETE TO authenticated USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Organizations and user_organizations policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their organizations" ON organizations
  FOR SELECT TO authenticated USING (
    id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to read their organization memberships" ON user_organizations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

