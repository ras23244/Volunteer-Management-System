-- Fix infinite recursion in profiles RLS policies
-- The select_all_profiles_admin policy checks profiles with a subquery,
-- which triggers RLS again. We replace it with a helper function that bypasses RLS.

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "select_all_profiles_admin" ON public.profiles;

-- Create a non-recursive version using the helper function
CREATE POLICY "select_all_profiles_admin" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Also fix the update admin policy which has the same issue
DROP POLICY IF EXISTS "update_profiles_admin" ON public.profiles;

CREATE POLICY "update_profiles_admin" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');
