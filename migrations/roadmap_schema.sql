-- Create Roadmap Tables

-- 1. Levels (The main stages: Level 0, Level 1, etc.)
CREATE TABLE IF NOT EXISTS public.roadmap_levels (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    icon TEXT, -- Material Symbol name
    color TEXT, -- Hex code for UI
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Modules (Sub-sections within a level, e.g., "Operational Systems", "Networking")
CREATE TABLE IF NOT EXISTS public.roadmap_modules (
    id SERIAL PRIMARY KEY,
    level_id INTEGER REFERENCES public.roadmap_levels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Topics (The actual learnable content items)
CREATE TABLE IF NOT EXISTS public.roadmap_topics (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES public.roadmap_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT, -- Markdown content
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Progress (Tracking what user has completed)
CREATE TABLE IF NOT EXISTS public.user_roadmap_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic_id INTEGER REFERENCES public.roadmap_topics(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('completed', 'in_progress')) DEFAULT 'completed',
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, topic_id)
);

-- Enable RLS
ALTER TABLE public.roadmap_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roadmap_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read levels" ON public.roadmap_levels FOR SELECT USING (true);
CREATE POLICY "Public read modules" ON public.roadmap_modules FOR SELECT USING (true);
CREATE POLICY "Public read topics" ON public.roadmap_topics FOR SELECT USING (true);
CREATE POLICY "Users can see own progress" ON public.user_roadmap_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_roadmap_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can modify own progress" ON public.user_roadmap_progress FOR UPDATE USING (auth.uid() = user_id);


-- SEED DATA (Zero to Hero)

-- Level 0
INSERT INTO public.roadmap_levels (title, description, order_index, icon, color) VALUES 
('NÍVEL 0 – FUNDAMENTOS', 'A Base de Verdade. Onde tudo começa.', 0, 'foundation', '#10b981');

-- Level 1
INSERT INTO public.roadmap_levels (title, description, order_index, icon, color) VALUES 
('NÍVEL 1 – BASE DE TI', 'Onde 90% desiste. Programação, Dados e Web.', 1, 'code', '#3b82f6');

-- Level 2
INSERT INTO public.roadmap_levels (title, description, order_index, icon, color) VALUES 
('NÍVEL 2 – FUNDAMENTOS DE SEGURANÇA', 'Entendendo a defesa para poder atacar.', 2, 'security', '#f59e0b');

-- Level 3
INSERT INTO public.roadmap_levels (title, description, order_index, icon, color) VALUES 
('NÍVEL 3 – PENTEST', 'O jogo começa aqui. Metodologia e Ferramentas.', 3, 'bug_report', '#ef4444');

-- Level 4
INSERT INTO public.roadmap_levels (title, description, order_index, icon, color) VALUES 
('NÍVEL 4 – RED TEAM', 'Mentalidade de atacante. Simulação de adversário.', 4, 'groups', '#8b5cf6');

-- Level 5
INSERT INTO public.roadmap_levels (title, description, order_index, icon, color) VALUES 
('NÍVEL 5 – PROFISSIONALIZAÇÃO', 'Relatórios, Mercado e Ética.', 5, 'work', '#ec4899');


-- Modules & Topics (Sample for Level 0 - incomplete for brevity, but structural)
-- We need to grab the IDs dynamically ideally, but for raw SQL we assume serial order if fresh.
-- Better to use a DO block or specific INSERTs.

DO $$
DECLARE
    l0_id INT;
    l1_id INT;
    l2_id INT;
    l3_id INT;
    l4_id INT;
    l5_id INT;
    m_id INT;
BEGIN
    SELECT id INTO l0_id FROM public.roadmap_levels WHERE order_index = 0 LIMIT 1;
    SELECT id INTO l1_id FROM public.roadmap_levels WHERE order_index = 1 LIMIT 1;
    SELECT id INTO l2_id FROM public.roadmap_levels WHERE order_index = 2 LIMIT 1;
    SELECT id INTO l3_id FROM public.roadmap_levels WHERE order_index = 3 LIMIT 1;
    SELECT id INTO l4_id FROM public.roadmap_levels WHERE order_index = 4 LIMIT 1;
    SELECT id INTO l5_id FROM public.roadmap_levels WHERE order_index = 5 LIMIT 1;

    -- --- LEVEL 0 ---
    
    -- M: Sistemas Operacionais
    INSERT INTO public.roadmap_modules (level_id, title, order_index) VALUES (l0_id, 'Sistemas Operacionais', 0) RETURNING id INTO m_id;
    INSERT INTO public.roadmap_topics (module_id, title, order_index) VALUES 
    (m_id, 'Conceitos gerais (Kernel, Threads, Memory)', 0),
    (m_id, 'Linux (Estrutura, Permissões, Bash)', 1),
    (m_id, 'Windows (Registry, Services, AD basics)', 2);

    -- M: Redes de Computadores
    INSERT INTO public.roadmap_modules (level_id, title, order_index) VALUES (l0_id, 'Redes de Computadores', 1) RETURNING id INTO m_id;
    INSERT INTO public.roadmap_topics (module_id, title, order_index) VALUES 
    (m_id, 'Fundamentos (LAN, WAN, VPN)', 0),
    (m_id, 'Modelos OSI e TCP/IP', 1),
    (m_id, 'Protocolos (TCP, UDP, HTTP, DNS)', 2),
    (m_id, 'Endereçamento (IPv4/v6, Subnetting)', 3),
    (m_id, 'Ferramentas (Ping, Wireshark)', 4);

    -- --- LEVEL 1 ---

    -- M: Programação
    INSERT INTO public.roadmap_modules (level_id, title, order_index) VALUES (l1_id, 'Programação', 0) RETURNING id INTO m_id;
    INSERT INTO public.roadmap_topics (module_id, title, order_index) VALUES 
    (m_id, 'Lógica de Programação', 0),
    (m_id, 'Python (Scripts, Sockets)', 1),
    (m_id, 'JavaScript & Bash', 2);

    -- M: Bancos de Dados
    INSERT INTO public.roadmap_modules (level_id, title, order_index) VALUES (l1_id, 'Bancos de Dados', 1) RETURNING id INTO m_id;
    INSERT INTO public.roadmap_topics (module_id, title, order_index) VALUES 
    (m_id, 'Conceitos e SQL Básico', 0);

    -- M: Web
    INSERT INTO public.roadmap_modules (level_id, title, order_index) VALUES (l1_id, 'Web Deep Dive', 2) RETURNING id INTO m_id;
    INSERT INTO public.roadmap_topics (module_id, title, order_index) VALUES 
    (m_id, 'HTML/CSS/JS', 0),
    (m_id, 'HTTP na prática (Headers, Cookies)', 1),
    (m_id, 'Back-end APIs', 2);

    -- --- LEVEL 2 ---
    
    -- M: Conceitos Essenciais
    INSERT INTO public.roadmap_modules (level_id, title, order_index) VALUES (l2_id, 'Conceitos Essenciais', 0) RETURNING id INTO m_id;
    INSERT INTO public.roadmap_topics (module_id, title, order_index) VALUES 
    (m_id, 'CIA Triad', 0),
    (m_id, 'Criptografia', 1);

    -- M: Segurança de Sistemas
    INSERT INTO public.roadmap_modules (level_id, title, order_index) VALUES (l2_id, 'Segurança de Sistemas', 1) RETURNING id INTO m_id;
    INSERT INTO public.roadmap_topics (module_id, title, order_index) VALUES 
    (m_id, 'Hardening Linux & Windows', 0);

    -- --- LEVEL 3 ---

    -- M: Metodologia Pentest
    INSERT INTO public.roadmap_modules (level_id, title, order_index) VALUES (l3_id, 'Metodologia', 0) RETURNING id INTO m_id;
    INSERT INTO public.roadmap_topics (module_id, title, order_index) VALUES 
    (m_id, 'Recon & Enumeração', 0),
    (m_id, 'Exploração & Pós-exploração', 1);

    -- M: Ferramentas
    INSERT INTO public.roadmap_modules (level_id, title, order_index) VALUES (l3_id, 'Ferramentas', 1) RETURNING id INTO m_id;
    INSERT INTO public.roadmap_topics (module_id, title, order_index) VALUES 
    (m_id, 'Nmap, Burp, Metasploit', 0);

    -- --- LEVEL 4 ---

    -- M: Red Team Ops
    INSERT INTO public.roadmap_modules (level_id, title, order_index) VALUES (l4_id, 'Red Team Ops', 0) RETURNING id INTO m_id;
    INSERT INTO public.roadmap_topics (module_id, title, order_index) VALUES 
    (m_id, 'Simulação de Adversário', 0);

    -- M: Active Directory
    INSERT INTO public.roadmap_modules (level_id, title, order_index) VALUES (l4_id, 'Active Directory', 1) RETURNING id INTO m_id;
    INSERT INTO public.roadmap_topics (module_id, title, order_index) VALUES 
    (m_id, 'Domain, Kerberos, NTLM', 0);

    -- --- LEVEL 5 ---
     -- M: Professional
    INSERT INTO public.roadmap_modules (level_id, title, order_index) VALUES (l5_id, 'Carreira & Ética', 0) RETURNING id INTO m_id;
    INSERT INTO public.roadmap_topics (module_id, title, order_index) VALUES 
    (m_id, 'Relatórios Técnicos', 0),
    (m_id, 'Mercado e Compliance', 1);

END $$;
