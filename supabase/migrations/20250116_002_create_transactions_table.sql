/*
  # Create Transactions Table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key) - Unique identifier for each transaction
      - `date` (timestamptz, not null) - Transaction date
      - `name` (text, not null) - Transaction description/name
      - `car` (text) - Vehicle identifier if applicable
      - `depositor` (text) - Person who made the deposit
      - `value` (numeric(12,2), not null) - Transaction amount
      - `status` (varchar(50), not null) - Transaction status (pending-ledger, pending-bank, reconciled, etc.)
      - `confidence` (integer) - Matching confidence score (0-100)
      - `source` (varchar(100)) - Source of the transaction (bank, ledger, manual)
      - `payment_method` (text) - Payment method used
      - `matched_transaction_id` (uuid) - Reference to matched transaction for reconciliation
      - `sheet_order` (integer) - Original row number from spreadsheet import
      - `created_at` (timestamptz, not null) - Record creation timestamp
      - `user_id` (uuid, not null) - Reference to the user who owns this transaction

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for authenticated users to read their own transactions
    - Add policy for authenticated users to insert their own transactions
    - Add policy for authenticated users to update their own transactions
    - Add policy for authenticated users to delete their own transactions

  3. Important Notes
    - Status values: 'pending-ledger', 'pending-bank', 'reconciled', 'manual'
    - Confidence scores range from 0 (no match) to 100 (perfect match)
    - Matched transactions reference each other via matched_transaction_id
    - All transactions are owned by a specific user for multi-tenancy
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date timestamptz NOT NULL,
  name text NOT NULL,
  car text,
  depositor text,
  value numeric(12,2) NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'pending-ledger',
  confidence integer,
  source varchar(100),
  payment_method text,
  matched_transaction_id uuid,
  sheet_order integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  CONSTRAINT fk_matched_transaction
    FOREIGN KEY (matched_transaction_id)
    REFERENCES transactions(id)
    ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_matched_id ON transactions(matched_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);

-- RLS Policies
-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own transactions
CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can delete their own transactions
CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Add check constraint for confidence score
ALTER TABLE transactions
  ADD CONSTRAINT check_confidence_range
  CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100));

-- Add check constraint for status values
ALTER TABLE transactions
  ADD CONSTRAINT check_status_values
  CHECK (status IN ('pending-ledger', 'pending-bank', 'reconciled', 'manual', 'deleted'));
