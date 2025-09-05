-- Clear break_from_time and break_to_time for all overtime records
UPDATE public.overtime_records 
SET 
  break_from_time = NULL,
  break_to_time = NULL;