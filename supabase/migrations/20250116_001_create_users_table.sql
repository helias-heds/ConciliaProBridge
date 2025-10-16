/*
  # Create Users Table

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique identifier for each user
      - `username` (text, unique, not null) - Username for authentication
      - `password` (text, not null) - Hashed password for authentication
      - `created_at` (timestamptz) - Account creation timestamp

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data only
    - Add policy for users to update their own data only

  3. Important Notes
    - Passwords should be hashed before storing (using bcrypt or similar)
    - The table uses UUID for primary key with automatic generation
    - Username must be unique across all users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- RLS Policies
-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Allow users to insert their own record (for registration)
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);
