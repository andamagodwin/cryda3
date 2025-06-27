-- Fix the numeric field overflow error
-- Run this in your Supabase SQL Editor

-- Update the price_per_seat column to handle larger values
ALTER TABLE rides 
ALTER COLUMN price_per_seat TYPE NUMERIC(20,8);

-- Also update the total_amount in bookings table if it exists
ALTER TABLE bookings 
ALTER COLUMN total_amount TYPE NUMERIC(20,8);

-- Verify the changes
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name IN ('rides', 'bookings') 
AND column_name IN ('price_per_seat', 'total_amount');
