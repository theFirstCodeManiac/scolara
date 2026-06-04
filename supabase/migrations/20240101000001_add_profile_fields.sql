-- Add extended profile fields for Nigerian university student signup
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS middle_name TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS matric_number TEXT,
  ADD COLUMN IF NOT EXISTS university TEXT,
  ADD COLUMN IF NOT EXISTS faculty TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Update the trigger function to populate the new fields from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, middle_name, username, matric_number, university, faculty, department, dob, gender, phone, address, role)
  VALUES (
    NEW.id,
    NEW.email,
    CONCAT(
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      ' ',
      COALESCE(NEW.raw_user_meta_data->>'middle_name', '')
    ),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'middle_name',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'matric_number',
    NEW.raw_user_meta_data->>'university',
    NEW.raw_user_meta_data->>'faculty',
    NEW.raw_user_meta_data->>'department',
    (NEW.raw_user_meta_data->>'dob')::DATE,
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    'student'::public.user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
