-- Phase 12: Orkut Revival Features

-- 1. Testimonials (Depoimentos)
CREATE TABLE IF NOT EXISTS testimonials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL CHECK (char_length(content) <= 1000),
    approved boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 2. Trust Ratings (The 3 Bars)
CREATE TABLE IF NOT EXISTS trust_ratings (
    rater_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    target_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    trust_score integer CHECK (trust_score BETWEEN 1 AND 3),
    cool_score integer CHECK (cool_score BETWEEN 1 AND 3),
    skill_score integer CHECK (skill_score BETWEEN 1 AND 3),
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (rater_id, target_id)
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_ratings ENABLE ROW LEVEL SECURITY;

-- Policies for Testimonials
CREATE POLICY "Public read testimonials" ON testimonials 
  FOR SELECT USING (approved = true OR auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Auth create testimonials" ON testimonials 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receiver update testimonials" ON testimonials 
  FOR UPDATE USING (auth.uid() = receiver_id);

CREATE POLICY "Sender delete testimonials" ON testimonials 
  FOR DELETE USING (auth.uid() = sender_id);

-- Policies for Trust Ratings
CREATE POLICY "Public read trust" ON trust_ratings 
  FOR SELECT USING (true);

CREATE POLICY "Auth rate trust" ON trust_ratings 
  FOR INSERT WITH CHECK (auth.uid() = rater_id);

CREATE POLICY "Auth update trust" ON trust_ratings 
  FOR UPDATE USING (auth.uid() = rater_id);
