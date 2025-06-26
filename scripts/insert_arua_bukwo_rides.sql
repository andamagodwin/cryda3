-- Insert fake ride from Arua to Bukwo for tomorrow
-- Run this in your Supabase SQL editor

INSERT INTO rides (
  driver_id,
  driver_name,
  start_location_label,
  end_location_label,
  departure_time,
  price_per_seat,
  total_seats,
  available_seats,
  payment_method,
  car_type,
  number_plate,
  status,
  created_at
) VALUES (
  'fake-driver-id-2',
  'John Mukasa',
  'Arua, Uganda',
  'Bukwo, Uganda',
  '2025-06-28T08:00:00+03:00', -- Tomorrow 8:00 AM EAT (East Africa Time)
  0.025, -- 0.025 ETH per seat (~$50-60 USD)
  4,
  4,
  'ETH',
  'Toyota Hiace',
  'UAP 456B',
  'active',
  NOW()
);

-- Insert another ride with CRYDA payment option
INSERT INTO rides (
  driver_id,
  driver_name,
  start_location_label,
  end_location_label,
  departure_time,
  price_per_seat,
  total_seats,
  available_seats,
  payment_method,
  car_type,
  number_plate,
  status,
  created_at
) VALUES (
  'fake-driver-id-3',
  'Sarah Namukasa',
  'Arua, Uganda',
  'Bukwo, Uganda',
  '2025-06-28T14:30:00+03:00', -- Tomorrow 2:30 PM EAT
  150.0, -- 150 CRYDA tokens per seat
  5,
  5,
  'CRYDA_TOKEN',
  'Toyota Noah',
  'UAF 789C',
  'active',
  NOW()
);

-- Optional: Insert a ride for later in the week
INSERT INTO rides (
  driver_id,
  driver_name,
  start_location_label,
  end_location_label,
  departure_time,
  price_per_seat,
  total_seats,
  available_seats,
  payment_method,
  car_type,
  number_plate,
  status,
  created_at
) VALUES (
  'fake-driver-id-4',
  'Moses Okello',
  'Arua, Uganda',
  'Bukwo, Uganda',
  '2025-06-30T10:00:00+03:00', -- Monday 10:00 AM EAT
  0.02, -- 0.02 ETH per seat
  6,
  6,
  'ETH',
  'Toyota Quantum',
  'UAM 012D',
  'active',
  NOW()
);
