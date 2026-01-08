-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  
  -- Add indexes for faster querying
  CONSTRAINT messages_sender_receiver_check CHECK (sender_id != receiver_id)
);

-- Index for fetching conversation
CREATE INDEX idx_messages_participants ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- RLS Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see messages they sent or received
CREATE POLICY "Users can see their own messages" 
ON messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Users can insert messages where they are the sender
CREATE POLICY "Users can send messages" 
ON messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update message status (read) if they are receiver
CREATE POLICY "Receivers can update read status" 
ON messages FOR UPDATE 
USING (auth.uid() = receiver_id);

-- Function to handle Realtime is handled by Supabase subscription
