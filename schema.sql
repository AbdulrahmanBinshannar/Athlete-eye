-- Athlete Eyes Database Schema

-- Table: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('player', 'coach')) NOT NULL,
  avatar_url TEXT,
  baseline_ready BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Function to sync auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'player'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Table: teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- format: AE-XXXX
  qr_code_url TEXT,
  max_players INT DEFAULT 30,
  alerts_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: join_requests
CREATE TABLE join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES users(id),
  team_id UUID REFERENCES teams(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- Table: team_members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, player_id)
);

-- Table: scans
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES users(id),
  video_url TEXT,
  readiness_score FLOAT,
  status_color TEXT CHECK (status_color IN ('green', 'yellow', 'red')),
  confidence_score FLOAT,
  low_lighting BOOLEAN DEFAULT FALSE,
  scan_type TEXT CHECK (scan_type IN ('baseline', 'regular', 'pregame')) DEFAULT 'regular',
  baseline_index INT, -- 1-5 for calibration scans
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: scan_metrics
CREATE TABLE scan_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
  metric_type TEXT CHECK (metric_type IN ('hr', 'hrv', 'blink_rate', 'reaction_time', 'gaze_accuracy')),
  value FLOAT NOT NULL,
  z_score FLOAT,
  baseline_diff FLOAT
);

-- Table: baselines
CREATE TABLE baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID UNIQUE REFERENCES users(id),
  scan_count INT DEFAULT 0,
  model_path TEXT,
  model_accuracy FLOAT,
  retrain_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: baseline_metrics
CREATE TABLE baseline_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baseline_id UUID REFERENCES baselines(id) ON DELETE CASCADE,
  metric_type TEXT CHECK (metric_type IN ('hr', 'hrv', 'blink_rate', 'reaction_time', 'gaze_accuracy')),
  mean_value FLOAT NOT NULL,
  std_value FLOAT NOT NULL,
  weight FLOAT NOT NULL -- percentage weight for readiness calculation
);

-- Table: scan_feedback
CREATE TABLE scan_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id),
  player_id UUID REFERENCES users(id),
  rating TEXT CHECK (rating IN ('accurate', 'inaccurate', 'unsure')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: recommendations
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('breathing', 'rest', 'hydration', 'warmup', 'focus', 'recovery')),
  message_ar TEXT NOT NULL,
  message_en TEXT NOT NULL,
  priority INT DEFAULT 1
);

-- Table: coach_notes
CREATE TABLE coach_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES users(id),
  player_id UUID REFERENCES users(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('join_request', 'accepted', 'rejected', 'red_alert', 'retrain_suggest')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE baseline_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Simple Policies (Players see own data, Coaches see team scans)
CREATE POLICY "Users insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Players see own scans" ON scans FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "Players create own scans" ON scans FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Coaches manage teams" ON teams FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "Coaches create teams" ON teams FOR INSERT WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Anyone view teams" ON teams FOR SELECT USING (true);

CREATE POLICY "Players create join requests" ON join_requests FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "Players view own join requests" ON join_requests FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "Coaches manage join requests" ON join_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM teams WHERE id = join_requests.team_id AND coach_id = auth.uid())
);

CREATE POLICY "Coaches manage team members" ON team_members FOR ALL USING (
  EXISTS (SELECT 1 FROM teams WHERE id = team_members.team_id AND coach_id = auth.uid())
);
CREATE POLICY "Players see their memberships" ON team_members FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Coaches see team member scans" ON scans FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN teams t ON tm.team_id = t.id
    WHERE tm.player_id = scans.player_id AND t.coach_id = auth.uid()
  )
);

-- Scan Metrics
CREATE POLICY "Players see own scan metrics" ON scan_metrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM scans WHERE id = scan_metrics.scan_id AND player_id = auth.uid())
);
CREATE POLICY "Coaches see team scan metrics" ON scan_metrics FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM scans s
    JOIN team_members tm ON s.player_id = tm.player_id
    JOIN teams t ON tm.team_id = t.id
    WHERE s.id = scan_metrics.scan_id AND t.coach_id = auth.uid()
  )
);
CREATE POLICY "Players insert own scan metrics" ON scan_metrics FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM scans WHERE id = scan_metrics.scan_id AND player_id = auth.uid())
);

-- Baselines
CREATE POLICY "Players manage own baseline" ON baselines FOR ALL USING (auth.uid() = player_id);
CREATE POLICY "Players manage own baseline metrics" ON baseline_metrics FOR ALL USING (
  EXISTS (SELECT 1 FROM baselines WHERE id = baseline_metrics.baseline_id AND player_id = auth.uid())
);

-- Feedback & Notes
CREATE POLICY "Players create feedback" ON scan_feedback FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "Coaches manage notes" ON coach_notes FOR ALL USING (coach_id = auth.uid());

-- Notifications
CREATE POLICY "Users manage own notifications" ON notifications FOR ALL USING (user_id = auth.uid());
