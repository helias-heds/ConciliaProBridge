/*
  # Create Google Sheets Connections Table

  1. New Tables
    - `google_sheets_connections`
      - `id` (uuid, primary key) - Unique identifier for each connection
      - `api_key` (text, not null) - Encrypted Google API key for authentication
      - `sheet_url` (text, not null) - Full URL to the Google Sheet
      - `sheet_id` (text) - Extracted Google Sheet ID
      - `last_import_date` (timestamptz) - Timestamp of last successful import
      - `last_import_count` (integer) - Number of records imported in last sync
      - `status` (varchar(50)) - Connection status (connected, error, disconnected)
      - `created_at` (timestamptz, not null) - Connection creation timestamp
      - `updated_at` (timestamptz, not null) - Last update timestamp
      - `user_id` (uuid, not null) - Reference to the user who owns this connection

  2. Security
    - Enable RLS on `google_sheets_connections` table
    - Add policy for authenticated users to read their own connections
    - Add policy for authenticated users to insert their own connections
    - Add policy for authenticated users to update their own connections
    - Add policy for authenticated users to delete their own connections

  3. Important Notes
    - API keys should be encrypted before storing for security
    - Status values: 'connected', 'error', 'disconnected', 'pending'
    - Each user can have multiple Google Sheets connections
    - The sheet_id is extracted from the sheet_url for API calls
    - Updated_at timestamp should be automatically updated on changes
*/

-- Create google_sheets_connections table
CREATE TABLE IF NOT EXISTS google_sheets_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key text NOT NULL,
  sheet_url text NOT NULL,
  sheet_id text,
  last_import_date timestamptz,
  last_import_count integer DEFAULT 0,
  status varchar(50) DEFAULT 'connected',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL
);

-- Enable Row Level Security
ALTER TABLE google_sheets_connections ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_google_sheets_user_id ON google_sheets_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_google_sheets_status ON google_sheets_connections(status);
CREATE INDEX IF NOT EXISTS idx_google_sheets_sheet_id ON google_sheets_connections(sheet_id);

-- RLS Policies
-- Users can read their own connections
CREATE POLICY "Users can read own connections"
  ON google_sheets_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Users can insert their own connections
CREATE POLICY "Users can insert own connections"
  ON google_sheets_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own connections
CREATE POLICY "Users can update own connections"
  ON google_sheets_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can delete their own connections
CREATE POLICY "Users can delete own connections"
  ON google_sheets_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Add check constraint for status values
ALTER TABLE google_sheets_connections
  ADD CONSTRAINT check_connection_status_values
  CHECK (status IN ('connected', 'error', 'disconnected', 'pending'));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_google_sheets_connections_updated_at'
  ) THEN
    CREATE TRIGGER update_google_sheets_connections_updated_at
      BEFORE UPDATE ON google_sheets_connections
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
