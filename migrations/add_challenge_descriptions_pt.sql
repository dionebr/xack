-- Add Portuguese description column to challenges table
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS description_pt TEXT;

-- Update Mitchell machine with Portuguese description
-- Keeping technical terms in English as requested
UPDATE challenges 
SET description_pt = 'Um servidor Tomcat vulnerável com múltiplas pistas falsas (red herrings) e privilege escalation via cron job mal configurado. Explore o Manager App, encontre flags ocultas e escale para root.'
WHERE name = 'Mitchell';

-- You can add more Portuguese descriptions for other machines:
-- UPDATE challenges 
-- SET description_pt = 'Sua descrição em PT aqui (mantendo termos técnicos em inglês)'
-- WHERE name = 'NomeDaMaquina';
