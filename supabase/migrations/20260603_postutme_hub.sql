-- ============================================================
-- SCOLARA POST-UTME HUB — Database Migration
-- Created: 2026-06-03
-- ============================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. HUB TUTORS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_tutors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  subjects TEXT[] DEFAULT '{}',
  universities TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  phone VARCHAR(20),
  website VARCHAR(255),
  social_links JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_tutors_user_id ON hub_tutors(user_id);
CREATE INDEX IF NOT EXISTS idx_hub_tutors_rating ON hub_tutors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_hub_tutors_subjects ON hub_tutors USING GIN(subjects);
CREATE INDEX IF NOT EXISTS idx_hub_tutors_universities ON hub_tutors USING GIN(universities);

-- ============================================================
-- 2. HUB TUTOR FOLLOWERS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_tutor_followers (
  tutor_id UUID NOT NULL REFERENCES hub_tutors(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tutor_id, follower_id)
);

CREATE INDEX IF NOT EXISTS idx_hub_followers_tutor ON hub_tutor_followers(tutor_id);
CREATE INDEX IF NOT EXISTS idx_hub_followers_user ON hub_tutor_followers(follower_id);

-- ============================================================
-- 3. HUB GROUPS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES hub_tutors(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  cover_url TEXT,
  university VARCHAR(200),
  subjects TEXT[] DEFAULT '{}',
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'invite_only')),
  join_fee_naira INTEGER DEFAULT 500,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  invite_token VARCHAR(64) UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_groups_tutor ON hub_groups(tutor_id);
CREATE INDEX IF NOT EXISTS idx_hub_groups_university ON hub_groups(university);
CREATE INDEX IF NOT EXISTS idx_hub_groups_subjects ON hub_groups USING GIN(subjects);
CREATE INDEX IF NOT EXISTS idx_hub_groups_visibility ON hub_groups(visibility);

-- ============================================================
-- 4. HUB GROUP MEMBERS (with payment tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES hub_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'free', 'refunded')),
  paystack_reference VARCHAR(100),
  paystack_payment_id VARCHAR(100),
  amount_paid_naira INTEGER DEFAULT 0,
  paid_at TIMESTAMPTZ,
  is_muted BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_hub_members_group ON hub_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_hub_members_user ON hub_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_hub_members_payment ON hub_group_members(payment_status);

-- ============================================================
-- 5. HUB RESOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES hub_groups(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES hub_tutors(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(20) DEFAULT 'pdf' CHECK (resource_type IN ('pdf', 'video', 'image', 'note', 'audio', 'link')),
  file_url TEXT,
  thumbnail_url TEXT,
  subject VARCHAR(100),
  year INTEGER,
  topic VARCHAR(200),
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  file_size_bytes BIGINT DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_resources_group ON hub_resources(group_id);
CREATE INDEX IF NOT EXISTS idx_hub_resources_tutor ON hub_resources(tutor_id);
CREATE INDEX IF NOT EXISTS idx_hub_resources_type ON hub_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_hub_resources_subject ON hub_resources(subject);
CREATE INDEX IF NOT EXISTS idx_hub_resources_year ON hub_resources(year);

-- ============================================================
-- 6. HUB RESOURCE BOOKMARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_resource_bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES hub_resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, resource_id)
);

-- ============================================================
-- 7. HUB RESOURCE COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_resource_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES hub_resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_resource_comments_resource ON hub_resource_comments(resource_id);

-- ============================================================
-- 8. HUB EXAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES hub_groups(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES hub_tutors(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  duration_minutes INTEGER DEFAULT 60,
  pass_mark INTEGER DEFAULT 50,
  total_marks INTEGER DEFAULT 100,
  subject VARCHAR(100),
  year INTEGER,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  allow_retake BOOLEAN DEFAULT FALSE,
  show_answers_after BOOLEAN DEFAULT TRUE,
  randomize_questions BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_exams_group ON hub_exams(group_id);
CREATE INDEX IF NOT EXISTS idx_hub_exams_tutor ON hub_exams(tutor_id);
CREATE INDEX IF NOT EXISTS idx_hub_exams_start ON hub_exams(start_at);
CREATE INDEX IF NOT EXISTS idx_hub_exams_published ON hub_exams(is_published);

-- ============================================================
-- 9. HUB QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES hub_exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false', 'short_answer', 'essay')),
  image_url TEXT,
  options JSONB DEFAULT '[]',  -- [{id, text, is_correct}] for MCQ
  correct_answer TEXT,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_questions_exam ON hub_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_hub_questions_order ON hub_questions(exam_id, order_index);

-- ============================================================
-- 10. HUB EXAM SESSIONS (student attempts)
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_exam_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES hub_exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}',  -- {question_id: answer}
  score INTEGER,
  percentage NUMERIC(5,2),
  passed BOOLEAN,
  time_spent_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'abandoned')),
  UNIQUE (exam_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_hub_sessions_exam ON hub_exam_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_hub_sessions_student ON hub_exam_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_hub_sessions_status ON hub_exam_sessions(status);

-- ============================================================
-- 11. HUB ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES hub_groups(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES hub_tutors(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  attachment_url TEXT,
  attachment_name VARCHAR(255),
  is_pinned BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  is_published BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_announcements_group ON hub_announcements(group_id);
CREATE INDEX IF NOT EXISTS idx_hub_announcements_pinned ON hub_announcements(is_pinned);
CREATE INDEX IF NOT EXISTS idx_hub_announcements_published ON hub_announcements(published_at DESC);

-- ============================================================
-- 12. HUB ANNOUNCEMENT REACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_announcement_reactions (
  announcement_id UUID NOT NULL REFERENCES hub_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL DEFAULT '👍',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (announcement_id, user_id)
);

-- ============================================================
-- 13. HUB ANNOUNCEMENT COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_announcement_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES hub_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_ann_comments ON hub_announcement_comments(announcement_id);

-- ============================================================
-- 14. HUB MESSAGES (group chat)
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES hub_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice', 'poll', 'gif', 'system')),
  media_url TEXT,
  media_name VARCHAR(255),
  media_size_bytes BIGINT,
  reply_to_id UUID REFERENCES hub_messages(id) ON DELETE SET NULL,
  poll_data JSONB,  -- {question, options:[{id,text,votes:[user_id]}], ends_at}
  is_pinned BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_messages_group ON hub_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hub_messages_sender ON hub_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_hub_messages_reply ON hub_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_hub_messages_pinned ON hub_messages(group_id, is_pinned) WHERE is_pinned = TRUE;

-- ============================================================
-- 15. HUB MESSAGE REACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_message_reactions (
  message_id UUID NOT NULL REFERENCES hub_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL DEFAULT '👍',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

-- ============================================================
-- 16. HUB DIRECT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice')),
  media_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_deleted_by_sender BOOLEAN DEFAULT FALSE,
  is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_dm_sender ON hub_direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_hub_dm_recipient ON hub_direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_hub_dm_conversation ON hub_direct_messages(
  LEAST(sender_id::text, recipient_id::text),
  GREATEST(sender_id::text, recipient_id::text),
  created_at DESC
);

-- ============================================================
-- 17. HUB NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  payload JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_notif_user ON hub_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hub_notif_read ON hub_notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================
-- 18. HUB LEADERBOARD CACHE
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_leaderboard (
  group_id UUID NOT NULL REFERENCES hub_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score NUMERIC(10,2) DEFAULT 0,
  exam_count INTEGER DEFAULT 0,
  avg_percentage NUMERIC(5,2) DEFAULT 0,
  rank INTEGER,
  streak_days INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_hub_leaderboard_rank ON hub_leaderboard(group_id, rank);

-- ============================================================
-- 19. HUB AI RECOMMENDATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES hub_groups(id) ON DELETE SET NULL,
  recommendation_type VARCHAR(50) DEFAULT 'study_plan',
  title VARCHAR(255),
  content JSONB DEFAULT '{}',
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_ai_recs_student ON hub_ai_recommendations(student_id, created_at DESC);

-- ============================================================
-- 20. HUB BLOCKED USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_blocked_users (
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- ============================================================
-- 21. HUB ASPIRANT PROFILES
-- (Separate from main 'profiles' table — aspirants, not university students)
-- ============================================================
CREATE TABLE IF NOT EXISTS hub_aspirants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  state_of_origin VARCHAR(100),
  target_university VARCHAR(200),
  target_course VARCHAR(200),
  utme_year INTEGER,
  subjects TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  bio TEXT,
  study_streak INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_aspirants_user ON hub_aspirants(user_id);
CREATE INDEX IF NOT EXISTS idx_hub_aspirants_university ON hub_aspirants(target_university);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE hub_tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_tutor_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_resource_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_resource_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_announcement_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_announcement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_aspirants ENABLE ROW LEVEL SECURITY;

-- hub_tutors: anyone can read; only tutor themselves can update
CREATE POLICY "Public read hub_tutors" ON hub_tutors FOR SELECT USING (true);
CREATE POLICY "Tutors manage own profile" ON hub_tutors FOR ALL USING (auth.uid() = user_id);

-- hub_groups: public groups readable by anyone
CREATE POLICY "Public groups readable" ON hub_groups FOR SELECT USING (visibility = 'public' OR tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid()));
CREATE POLICY "Tutors manage own groups" ON hub_groups FOR ALL USING (tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid()));

-- hub_group_members: members see own membership; tutors see their group members
CREATE POLICY "Members read own membership" ON hub_group_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Tutors read group members" ON hub_group_members FOR SELECT USING (group_id IN (SELECT id FROM hub_groups WHERE tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid())));
CREATE POLICY "Users join groups" ON hub_group_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own membership" ON hub_group_members FOR UPDATE USING (user_id = auth.uid());

-- hub_resources: paid members can read; tutors can insert
CREATE POLICY "Members read resources" ON hub_resources FOR SELECT USING (
  group_id IN (SELECT group_id FROM hub_group_members WHERE user_id = auth.uid() AND payment_status IN ('paid', 'free'))
  OR group_id IN (SELECT id FROM hub_groups WHERE tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid()))
  OR is_free_preview = true
);
CREATE POLICY "Tutors manage resources" ON hub_resources FOR ALL USING (tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid()));

-- hub_exams: same as resources
CREATE POLICY "Members read exams" ON hub_exams FOR SELECT USING (
  group_id IN (SELECT group_id FROM hub_group_members WHERE user_id = auth.uid() AND payment_status IN ('paid', 'free'))
  OR group_id IN (SELECT id FROM hub_groups WHERE tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid()))
);
CREATE POLICY "Tutors manage exams" ON hub_exams FOR ALL USING (tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid()));

-- hub_questions: same restrictions as exams
CREATE POLICY "Members read questions" ON hub_questions FOR SELECT USING (
  exam_id IN (SELECT id FROM hub_exams WHERE group_id IN (
    SELECT group_id FROM hub_group_members WHERE user_id = auth.uid() AND payment_status IN ('paid', 'free')
  ))
);
CREATE POLICY "Tutors manage questions" ON hub_questions FOR ALL USING (
  exam_id IN (SELECT id FROM hub_exams WHERE tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid()))
);

-- hub_exam_sessions: students own their sessions
CREATE POLICY "Students own sessions" ON hub_exam_sessions FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Tutors read group sessions" ON hub_exam_sessions FOR SELECT USING (
  exam_id IN (SELECT id FROM hub_exams WHERE tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid()))
);

-- hub_announcements: members read; tutors manage
CREATE POLICY "Members read announcements" ON hub_announcements FOR SELECT USING (
  group_id IN (SELECT group_id FROM hub_group_members WHERE user_id = auth.uid() AND payment_status IN ('paid', 'free'))
  OR group_id IN (SELECT id FROM hub_groups WHERE tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid()))
);
CREATE POLICY "Tutors manage announcements" ON hub_announcements FOR ALL USING (tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid()));

-- hub_messages: members read and write
CREATE POLICY "Members read messages" ON hub_messages FOR SELECT USING (
  group_id IN (SELECT group_id FROM hub_group_members WHERE user_id = auth.uid() AND payment_status IN ('paid', 'free'))
  OR group_id IN (SELECT id FROM hub_groups WHERE tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid()))
);
CREATE POLICY "Members send messages" ON hub_messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND (
    group_id IN (SELECT group_id FROM hub_group_members WHERE user_id = auth.uid() AND payment_status IN ('paid', 'free'))
    OR group_id IN (SELECT id FROM hub_groups WHERE tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid()))
  )
);
CREATE POLICY "Senders edit own messages" ON hub_messages FOR UPDATE USING (sender_id = auth.uid());

-- hub_notifications: users own their notifications
CREATE POLICY "Users own notifications" ON hub_notifications FOR ALL USING (user_id = auth.uid());

-- hub_direct_messages: sender and recipient access
CREATE POLICY "DM participants access" ON hub_direct_messages FOR ALL USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- hub_aspirants: users own profile; tutor can read members
CREATE POLICY "Aspirants own profile" ON hub_aspirants FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Public read aspirant profile" ON hub_aspirants FOR SELECT USING (true);

-- hub_leaderboard: members can read group leaderboard
CREATE POLICY "Members read leaderboard" ON hub_leaderboard FOR SELECT USING (
  group_id IN (SELECT group_id FROM hub_group_members WHERE user_id = auth.uid() AND payment_status IN ('paid', 'free'))
  OR group_id IN (SELECT id FROM hub_groups WHERE tutor_id IN (SELECT id FROM hub_tutors WHERE user_id = auth.uid()))
);
CREATE POLICY "System updates leaderboard" ON hub_leaderboard FOR ALL USING (true);

-- hub_ai_recommendations: students own recs
CREATE POLICY "Students own AI recs" ON hub_ai_recommendations FOR ALL USING (student_id = auth.uid());

-- hub_blocked_users
CREATE POLICY "Users manage own blocks" ON hub_blocked_users FOR ALL USING (blocker_id = auth.uid());

-- Reactions and bookmarks (users own their own)
CREATE POLICY "Users own reactions (announcements)" ON hub_announcement_reactions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Anyone read announcement reactions" ON hub_announcement_reactions FOR SELECT USING (true);
CREATE POLICY "Users own message reactions" ON hub_message_reactions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Anyone read message reactions" ON hub_message_reactions FOR SELECT USING (true);
CREATE POLICY "Users own bookmarks" ON hub_resource_bookmarks FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users read own bookmarks" ON hub_resource_bookmarks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Members post resource comments" ON hub_resource_comments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Public read resource comments" ON hub_resource_comments FOR SELECT USING (true);
CREATE POLICY "Members post ann comments" ON hub_announcement_comments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Public read ann comments" ON hub_announcement_comments FOR SELECT USING (true);
CREATE POLICY "Public read tutor followers" ON hub_tutor_followers FOR SELECT USING (true);
CREATE POLICY "Users manage own follows" ON hub_tutor_followers FOR ALL USING (follower_id = auth.uid());

-- ============================================================
-- ENABLE REALTIME ON KEY TABLES
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE hub_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE hub_direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE hub_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE hub_announcement_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE hub_message_reactions;
