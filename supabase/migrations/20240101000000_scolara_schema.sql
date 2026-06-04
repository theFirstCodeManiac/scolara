-- Enable the uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Roles Enum
CREATE TYPE public.user_role AS ENUM ('student', 'class_rep', 'admin', 'tutor', 'super_admin');

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role public.user_role DEFAULT 'student'::public.user_role NOT NULL,
    university TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to automatically create a profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Extracted Topics Table (for Topic Ranking)
CREATE TABLE public.extracted_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_code TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    frequency INTEGER DEFAULT 1,
    weight INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Exam Predictions Table
CREATE TABLE public.exam_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_code TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    probability INTEGER NOT NULL, -- 0-100
    trend TEXT DEFAULT 'flat', -- up, down, flat
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Study Plans Table
CREATE TABLE public.study_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exam_date DATE NOT NULL,
    hours_per_day INTEGER NOT NULL,
    pacing TEXT NOT NULL,
    weak_topics TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Study Sessions (Pomodoro) Table
CREATE TABLE public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    session_type TEXT NOT NULL, -- focus, break
    completed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Marketplace Resources Table
CREATE TABLE public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    file_url TEXT NOT NULL,
    ai_score INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    course_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Extracted Topics: Users can CRUD their own topics
CREATE POLICY "Users can CRUD own topics" 
    ON public.extracted_topics FOR ALL 
    USING (auth.uid() = user_id);

-- Exam Predictions: Users can view their own predictions
CREATE POLICY "Users can CRUD own predictions" 
    ON public.exam_predictions FOR ALL 
    USING (auth.uid() = user_id);

-- Study Plans: Users can CRUD their own plans
CREATE POLICY "Users can CRUD own study plans" 
    ON public.study_plans FOR ALL 
    USING (auth.uid() = user_id);

-- Study Sessions: Users can CRUD their own sessions
CREATE POLICY "Users can CRUD own study sessions" 
    ON public.study_sessions FOR ALL 
    USING (auth.uid() = user_id);

-- Resources: Anyone can view, authors can CRUD their own
CREATE POLICY "Anyone can view resources" 
    ON public.resources FOR SELECT 
    USING (true);

CREATE POLICY "Authors can CRUD own resources" 
    ON public.resources FOR ALL 
    USING (auth.uid() = author_id);
