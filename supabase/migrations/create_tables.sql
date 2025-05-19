-- Create moodboards table
CREATE TABLE IF NOT EXISTS moodboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_email for faster queries
CREATE INDEX IF NOT EXISTS idx_moodboards_user_email ON moodboards(user_email);

-- Create moodboard_pins table
CREATE TABLE IF NOT EXISTS moodboard_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id UUID NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
  pin_id TEXT NOT NULL,
  pin_data JSONB NOT NULL,
  position_x FLOAT,
  position_y FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on moodboard_id for faster queries
CREATE INDEX IF NOT EXISTS idx_moodboard_pins_moodboard_id ON moodboard_pins(moodboard_id);

-- Create unique constraint to prevent duplicate pins in a moodboard
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pin_per_moodboard ON moodboard_pins(moodboard_id, pin_id);

-- Create Row Level Security (RLS) policies
-- Enable RLS on tables
ALTER TABLE moodboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodboard_pins ENABLE ROW LEVEL SECURITY;

-- Create policies for moodboards table
-- Allow users to select their own moodboards
CREATE POLICY select_own_moodboards ON moodboards
  FOR SELECT USING (true);  -- Public read access for now, can be restricted later

-- Allow users to insert their own moodboards
CREATE POLICY insert_own_moodboards ON moodboards
  FOR INSERT WITH CHECK (true);  -- Public insert access for now, can be restricted later

-- Allow users to update their own moodboards
CREATE POLICY update_own_moodboards ON moodboards
  FOR UPDATE USING (true);  -- Public update access for now, can be restricted later

-- Allow users to delete their own moodboards
CREATE POLICY delete_own_moodboards ON moodboards
  FOR DELETE USING (true);  -- Public delete access for now, can be restricted later

-- Create policies for moodboard_pins table
-- Allow users to select pins from their moodboards
CREATE POLICY select_own_moodboard_pins ON moodboard_pins
  FOR SELECT USING (true);  -- Public read access for now, can be restricted later

-- Allow users to insert pins into their moodboards
CREATE POLICY insert_own_moodboard_pins ON moodboard_pins
  FOR INSERT WITH CHECK (true);  -- Public insert access for now, can be restricted later

-- Allow users to update pins in their moodboards
CREATE POLICY update_own_moodboard_pins ON moodboard_pins
  FOR UPDATE USING (true);  -- Public update access for now, can be restricted later

-- Allow users to delete pins from their moodboards
CREATE POLICY delete_own_moodboard_pins ON moodboard_pins
  FOR DELETE USING (true);  -- Public delete access for now, can be restricted later

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_moodboards_updated_at
BEFORE UPDATE ON moodboards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
