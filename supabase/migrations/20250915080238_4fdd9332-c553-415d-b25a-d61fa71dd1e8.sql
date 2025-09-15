-- Set plan_overtime_hour to 0 for all overtime records
UPDATE public.overtime_records 
SET plan_overtime_hour = 0;