-- === Block 1: Generate company code function ===
CREATE OR REPLACE FUNCTION generate_company_code()
RETURNS varchar AS $$
DECLARE
  code varchar(6);
  exists boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS(
      SELECT 1 FROM companies WHERE company_code = code
    ) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- === Block 2: companies table ===
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  owner_email varchar NOT NULL,
  owner_auth_id uuid REFERENCES auth.users(id),
  logo_url varchar,
  company_code varchar(6) UNIQUE NOT NULL DEFAULT generate_company_code(),
  created_at timestamptz DEFAULT now()
);

-- === Block 3: employees table ===
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  username varchar UNIQUE NOT NULL,
  auth_user_id uuid REFERENCES auth.users(id),
  daily_rate numeric DEFAULT 0,
  bank_name varchar,
  account_number varchar,
  account_holder varchar,
  created_at timestamptz DEFAULT now()
);

-- === Block 4: payslips table ===
CREATE TABLE payslips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  days_worked numeric DEFAULT 0,
  daily_rate numeric DEFAULT 0,
  total_basic_salary numeric GENERATED ALWAYS AS (days_worked * daily_rate) STORED,
  shimei_points numeric DEFAULT 0,
  shimei_back_rate numeric DEFAULT 0,
  shimei_total_back numeric GENERATED ALWAYS AS (shimei_points * shimei_back_rate) STORED,
  ld_count numeric DEFAULT 0,
  ld_rate numeric DEFAULT 0,
  total_ld_back numeric GENERATED ALWAYS AS (ld_count * ld_rate) STORED,
  dohan_back numeric DEFAULT 0,
  total_back numeric GENERATED ALWAYS AS
    (shimei_points * shimei_back_rate + ld_count * ld_rate + dohan_back) STORED,
  deduction_hm numeric DEFAULT 0,
  deduction_penalty numeric DEFAULT 0,
  deduction_apartment numeric DEFAULT 0,
  total_net_salary numeric GENERATED ALWAYS AS
    (days_worked * daily_rate
     + shimei_points * shimei_back_rate
     + ld_count * ld_rate
     + dohan_back
     - deduction_hm
     - deduction_penalty
     - deduction_apartment) STORED,
  status varchar DEFAULT 'draft' CHECK (status IN ('draft','published','confirmed')),
  is_confirmed boolean DEFAULT false,
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- === Block 5: RLS Policies ===
-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;

-- companies: owner access only
CREATE POLICY "Owner can manage their company"
ON companies FOR ALL
USING (owner_auth_id = auth.uid());

-- employees: owner can read/write, employee can read/update own row
CREATE POLICY "Owner can manage employees"
ON employees FOR ALL
USING (
  company_id IN (
    SELECT id FROM companies WHERE owner_auth_id = auth.uid()
  )
);

CREATE POLICY "Employee can read and update own row"
ON employees FOR ALL
USING (auth_user_id = auth.uid());

-- payslips: owner full access, employee read-only when published
CREATE POLICY "Owner can manage payslips"
ON payslips FOR ALL
USING (
  company_id IN (
    SELECT id FROM companies WHERE owner_auth_id = auth.uid()
  )
);

CREATE POLICY "Employee can view own published payslips"
ON payslips FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees WHERE auth_user_id = auth.uid()
  )
  AND status = 'published'
);
