/*
# Add trigger to auto-create profile on auth.users insert

1. Purpose
Ensure that when a user signs up via Supabase Auth, a corresponding `profiles` row is created automatically in the database. This fixes the race condition where the client-side profile insert fails because the user row doesn't exist yet or there is no active session.

2. Changes
- Create a PL/pgSQL function `handle_new_user()` that reads `name`, `email`, `role`, `phone` from `auth.users.raw_user_meta_data` and inserts a row into `profiles`.
- Create a trigger `on_auth_user_created` on `auth.users` that fires `AFTER INSERT` and calls `handle_new_user()`.

3. Important Notes
1. The client must pass `name`, `role`, and `phone` in `user_metadata` during `signUp` for this trigger to work.
2. `raw_user_meta_data` is the field that stores the user metadata provided by the client.
3. The trigger runs in the same transaction as the auth insert, so the profile row is guaranteed to exist.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, phone, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'volunteer'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'pending'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
