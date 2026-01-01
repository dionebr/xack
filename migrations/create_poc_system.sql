-- Create PoC Questions table
CREATE TABLE IF NOT EXISTS challenge_poc_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id TEXT REFERENCES challenges(id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  question_text TEXT NOT NULL,
  question_text_pt TEXT,
  hint TEXT,
  hint_pt TEXT,
  validation_type VARCHAR(20) NOT NULL CHECK (validation_type IN ('exact', 'regex', 'flag')),
  correct_answer TEXT NOT NULL,
  points INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create User PoC Progress table
CREATE TABLE IF NOT EXISTS user_poc_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT REFERENCES challenges(id) ON DELETE CASCADE,
  question_id UUID REFERENCES challenge_poc_questions(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id, question_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_poc_questions_challenge ON challenge_poc_questions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_poc_progress_user_challenge ON user_poc_progress(user_id, challenge_id);

-- Enable RLS
ALTER TABLE challenge_poc_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_poc_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenge_poc_questions (public read)
CREATE POLICY "Anyone can view PoC questions"
  ON challenge_poc_questions FOR SELECT
  USING (true);

-- RLS Policies for user_poc_progress (users can only see/modify their own)
CREATE POLICY "Users can view their own PoC progress"
  ON user_poc_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PoC progress"
  ON user_poc_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PoC progress"
  ON user_poc_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Seed Mitchell machine with example PoC questions
-- First, get Mitchell's ID (assuming it exists)
DO $$
DECLARE
  mitchell_id TEXT;
BEGIN
  SELECT id INTO mitchell_id FROM challenges WHERE name = 'Mitchell' LIMIT 1;
  
  IF mitchell_id IS NOT NULL THEN
    -- Insert PoC questions for Mitchell
    INSERT INTO challenge_poc_questions (challenge_id, question_order, question_text, question_text_pt, hint, hint_pt, validation_type, correct_answer, points)
    VALUES
    (
      mitchell_id,
      1,
      'What is the Apache Tomcat version running on the target? (Format: X.X.x)',
      'Qual é a versão do Apache Tomcat rodando no alvo? (Formato: X.X.x)',
      'Use nmap service detection or check the HTTP response headers',
      'Use detecção de serviço do nmap ou verifique os headers HTTP da resposta',
      'regex',
      '^8\.5\.\d+$',
      15
    ),
    (
      mitchell_id,
      2,
      'What HTTP method is enabled on the Tomcat Manager that could be exploited?',
      'Qual método HTTP está habilitado no Tomcat Manager que poderia ser explorado?',
      'Try different HTTP methods like GET, POST, PUT, DELETE on /manager/html',
      'Tente diferentes métodos HTTP como GET, POST, PUT, DELETE em /manager/html',
      'exact',
      'PUT',
      15
    ),
    (
      mitchell_id,
      3,
      'What is the default credentials pattern for Tomcat Manager? (Format: username:password)',
      'Qual é o padrão de credenciais padrão do Tomcat Manager? (Formato: usuario:senha)',
      'Check common Tomcat default credentials or brute force with common wordlists',
      'Verifique credenciais padrão comuns do Tomcat ou faça brute force com wordlists comuns',
      'regex',
      '^(tomcat|admin):(tomcat|admin|s3cret)$',
      20
    );
  END IF;
END $$;
