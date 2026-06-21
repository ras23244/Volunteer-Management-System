/*
# NayePankh Foundation Volunteer Management System Schema

1. New Tables
- `profiles` — Extended user profiles linked to Supabase auth.users
  - `id` (uuid, primary key, references auth.users)
  - `name` (text, not null)
  - `email` (text, unique, not null)
  - `phone` (text)
  - `role` (text, not null, check volunteer|admin)
  - `city` (text)
  - `skills` (text array, default empty)
  - `interests` (text array, default empty)
  - `status` (text, default 'pending', check pending|approved|rejected)
  - `created_at` (timestamptz, default now())

- `events` — NGO events that volunteers can apply to
  - `id` (uuid, primary key, default gen_random_uuid)
  - `title` (text, not null)
  - `description` (text)
  - `date` (timestamptz, not null)
  - `location` (text, not null)
  - `category` (text, not null)
  - `required_volunteers` (integer, default 0)
  - `created_by` (uuid, references auth.users)
  - `created_at` (timestamptz, default now())

- `applications` — Volunteer applications to events
  - `id` (uuid, primary key, default gen_random_uuid)
  - `event_id` (uuid, references events, not null)
  - `volunteer_id` (uuid, references auth.users, not null)
  - `status` (text, default 'applied', check applied|approved|rejected|withdrawn)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on all three tables.
- Profiles: authenticated users can read/update their own profile. Admins can read all profiles.
- Events: authenticated users can read all events. Admins can create/update/delete events.
- Applications: volunteers can read/create their own applications. Admins can read/update all applications.

3. Important Notes
1. The `profiles` table uses `id` as the primary key and references `auth.users(id)` so it aligns with Supabase auth.
2. `role` is stored in `profiles` and checked in RLS policies via a subquery.
3. `status` on profiles controls whether a volunteer is approved by an admin.
4. `applications` has a unique constraint on (event_id, volunteer_id) to prevent duplicate applications.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('volunteer', 'admin')),
  city text,
  skills text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date timestamptz NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  required_volunteers integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  volunteer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'approved', 'rejected', 'withdrawn')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (event_id, volunteer_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "select_all_profiles_admin" ON profiles;
CREATE POLICY "select_all_profiles_admin" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_profiles_admin" ON profiles;
CREATE POLICY "update_profiles_admin" ON profiles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Events policies
DROP POLICY IF EXISTS "select_all_events" ON events;
CREATE POLICY "select_all_events" ON events FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_events_admin" ON events;
CREATE POLICY "insert_events_admin" ON events FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "update_events_admin" ON events;
CREATE POLICY "update_events_admin" ON events FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "delete_events_admin" ON events;
CREATE POLICY "delete_events_admin" ON events FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Applications policies
DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications" ON applications FOR SELECT
  TO authenticated USING (auth.uid() = volunteer_id);

DROP POLICY IF EXISTS "select_all_applications_admin" ON applications;
CREATE POLICY "select_all_applications_admin" ON applications FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = volunteer_id);

DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications" ON applications FOR UPDATE
  TO authenticated USING (auth.uid() = volunteer_id) WITH CHECK (auth.uid() = volunteer_id);

DROP POLICY IF EXISTS "update_applications_admin" ON applications;
CREATE POLICY "update_applications_admin" ON applications FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
