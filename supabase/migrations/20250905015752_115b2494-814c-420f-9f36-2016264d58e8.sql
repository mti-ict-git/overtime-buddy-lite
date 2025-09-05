-- Set calculation_based_on_time to false (N) for all overtime records
UPDATE public.overtime_records 
SET calculation_based_on_time = false;