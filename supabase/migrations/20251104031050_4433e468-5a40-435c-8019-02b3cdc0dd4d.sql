-- Drop the old version of submit_overtime_entry that uses integer
DROP FUNCTION IF EXISTS public.submit_overtime_entry(text, date, boolean, integer, date, time, date, time, text, time, time, text, text, text);

-- Ensure only the numeric version exists
-- This function should already exist from the previous migration