-- OfferPilot Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  school TEXT,
  major TEXT,
  degree TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  resume_count INTEGER DEFAULT 0,
  analysis_count INTEGER DEFAULT 0,
  optimize_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JD Jobs table
CREATE TABLE IF NOT EXISTS public.jd_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  source_url TEXT,
  raw_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JD Analyses table
CREATE TABLE IF NOT EXISTS public.jd_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID,
  jd_id UUID REFERENCES public.jd_jobs(id) ON DELETE CASCADE NOT NULL,
  overall_score INTEGER,
  skill_score INTEGER,
  experience_score INTEGER,
  keyword_score INTEGER,
  keywords JSONB DEFAULT '[]',
  ats_keywords JSONB DEFAULT '[]',
  hard_requirements JSONB DEFAULT '[]',
  soft_requirements JSONB DEFAULT '[]',
  missing_items JSONB DEFAULT '[]',
  match_details JSONB DEFAULT '{}',
  ai_raw_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  parsed_data JSONB DEFAULT '{}',
  is_parsed BOOLEAN DEFAULT FALSE,
  parse_status TEXT DEFAULT 'pending',
  parse_error TEXT,
  source TEXT DEFAULT 'upload',
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume Versions table
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  version_label TEXT,
  optimize_type TEXT,
  jd_id UUID REFERENCES public.jd_jobs(id),
  original_content TEXT,
  optimized_content TEXT NOT NULL,
  optimize_details JSONB DEFAULT '{}',
  pdf_url TEXT,
  docx_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview Questions table
CREATE TABLE IF NOT EXISTS public.interview_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  jd_id UUID REFERENCES public.jd_jobs(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_hint TEXT,
  star_answer TEXT,
  follow_ups JSONB DEFAULT '[]',
  confidence_score INTEGER,
  is_favorited BOOLEAN DEFAULT FALSE,
  is_practiced BOOLEAN DEFAULT FALSE,
  practice_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Skills table
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  skill_category TEXT,
  proficiency_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

-- User Experiences table
CREATE TABLE IF NOT EXISTS public.user_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experience_type TEXT NOT NULL,
  title TEXT NOT NULL,
  organization TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  achievements JSONB DEFAULT '[]',
  related_skills JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Logs table
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  request_data JSONB,
  response_data JSONB,
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jd_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jd_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- JD Jobs policies
CREATE POLICY "Users can view own jobs" ON public.jd_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs" ON public.jd_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON public.jd_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" ON public.jd_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- JD Analyses policies
CREATE POLICY "Users can view own analyses" ON public.jd_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON public.jd_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON public.jd_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Resumes policies
CREATE POLICY "Users can view own resumes" ON public.resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON public.resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON public.resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON public.resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Resume Versions policies
CREATE POLICY "Users can view own versions" ON public.resume_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.resumes
      WHERE resumes.id = resume_versions.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own versions" ON public.resume_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resumes
      WHERE resumes.id = resume_versions.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

-- Interview Questions policies
CREATE POLICY "Users can view own questions" ON public.interview_questions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questions" ON public.interview_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions" ON public.interview_questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions" ON public.interview_questions
  FOR DELETE USING (auth.uid() = user_id);

-- User Skills policies
CREATE POLICY "Users can view own skills" ON public.user_skills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills" ON public.user_skills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills" ON public.user_skills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills" ON public.user_skills
  FOR DELETE USING (auth.uid() = user_id);

-- User Experiences policies
CREATE POLICY "Users can view own experiences" ON public.user_experiences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiences" ON public.user_experiences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiences" ON public.user_experiences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiences" ON public.user_experiences
  FOR DELETE USING (auth.uid() = user_id);

-- Usage Logs policies
CREATE POLICY "Users can view own logs" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON public.usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jd_jobs_user_id ON public.jd_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jd_jobs_created_at ON public.jd_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jd_analyses_user_id ON public.jd_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_jd_analyses_jd_id ON public.jd_analyses(jd_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON public.resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_user_id ON public.interview_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_experiences_user_id ON public.user_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  10485760,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for exports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exports',
  'exports',
  false,
  5242880,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own resumes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own resumes" ON storage.objects
  FOR DELETE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own exports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own exports" ON storage.objects
  FOR SELECT USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'resumes' THEN
    UPDATE public.users
    SET resume_count = (SELECT COUNT(*) FROM public.resumes WHERE user_id = auth.uid())
    WHERE id = auth.uid();
  ELSIF TG_TABLE_NAME = 'jd_analyses' THEN
    UPDATE public.users
    SET analysis_count = (SELECT COUNT(*) FROM public.jd_analyses WHERE user_id = auth.uid())
    WHERE id = auth.uid();
  ELSIF TG_TABLE_NAME = 'resume_versions' THEN
    UPDATE public.users
    SET optimize_count = (SELECT COUNT(*) FROM public.resume_versions WHERE resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid()))
    WHERE id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_resume_count
  AFTER INSERT ON public.resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_analysis_count
  AFTER INSERT ON public.jd_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_optimize_count
  AFTER INSERT ON public.resume_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.jd_analyses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resume_versions;

-- Comments for documentation
COMMENT ON TABLE public.users IS 'User profile information';
COMMENT ON TABLE public.jd_jobs IS 'Job descriptions pasted by users';
COMMENT ON TABLE public.jd_analyses IS 'Analysis results of job descriptions';
COMMENT ON TABLE public.resumes IS 'User uploaded resumes';
COMMENT ON TABLE public.resume_versions IS 'Resume optimization versions';
COMMENT ON TABLE public.interview_questions IS 'AI generated interview questions';
COMMENT ON TABLE public.user_skills IS 'User skills inventory';
COMMENT ON TABLE public.user_experiences IS 'User experiences (internships, projects, etc.)';
COMMENT ON TABLE public.usage_logs IS 'User activity logs for analytics';
