-- Feed Posts table for the social feed
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Post Likes (many-to-many: user likes a post)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Comments on posts
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Follows table (follower follows following)
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- Allow users to search for other users (public read on profiles)
DROP POLICY IF EXISTS "Public can view any profile" ON public.profiles;
CREATE POLICY "Public can view any profile"
  ON public.profiles FOR SELECT
  USING (true);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Anyone can view posts"
  ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Anyone can view likes"
  ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts"
  ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts"
  ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments"
  ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment"
  ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments"
  ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Anyone can view follows"
  ON public.follows FOR SELECT USING (true);
CREATE POLICY "Authenticated users can follow"
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Add missing profile fields that signup collects
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS middle_name TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS matric_number TEXT,
  ADD COLUMN IF NOT EXISTS faculty TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Update the handle_new_user trigger to capture all metadata fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, first_name, middle_name, username, matric_number,
    university, faculty, department, dob, gender, phone, address, avatar_url, role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'first_name'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'middle_name',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'matric_number',
    NEW.raw_user_meta_data->>'university',
    NEW.raw_user_meta_data->>'faculty',
    NEW.raw_user_meta_data->>'department',
    NULLIF(NEW.raw_user_meta_data->>'dob', '')::DATE,
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    middle_name = EXCLUDED.middle_name,
    username = EXCLUDED.username,
    matric_number = EXCLUDED.matric_number,
    university = EXCLUDED.university,
    faculty = EXCLUDED.faculty,
    department = EXCLUDED.department,
    dob = EXCLUDED.dob,
    gender = EXCLUDED.gender,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
