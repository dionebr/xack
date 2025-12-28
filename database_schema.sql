-- Tipos ENUM para garantir consistência
CREATE TYPE challenge_type AS ENUM ('docker', 'vm');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'insane');
CREATE TYPE instance_status AS ENUM ('spawning', 'running', 'stopping', 'error');
CREATE TYPE flag_type AS ENUM ('user', 'root');
-- Adicionando categorias de CTF
CREATE TYPE challenge_category AS ENUM ('web', 'pwn', 'reversing', 'crypto', 'forensics', 'mobile', 'cloud', 'osint', 'misc', 'active_directory');

-- Tabela de Perfis (Estendendo auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  vpn_ip INET UNIQUE,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Desafios (Máquinas)
CREATE TABLE public.challenges (
  id TEXT PRIMARY KEY, -- Slug, ex: 'web-injection-01' ou '1' (para legelado)
  name TEXT NOT NULL, -- Ex: 'Protocol Omega', 'Cloud Leak'
  type challenge_type NOT NULL,
  category challenge_category NOT NULL, -- Nova coluna de categoria
  difficulty difficulty_level NOT NULL,
  description TEXT,
  estimated_time TEXT,
  points INTEGER DEFAULT 0,
  image_id TEXT, -- Docker Image Name ou Proxmox Template ID
  config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Conteúdo do machine.json
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Instâncias Ativas
CREATE TABLE public.active_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id TEXT REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  status instance_status DEFAULT 'spawning',
  ip_address INET, -- IP interno da máquina alvo
  docker_container_id TEXT,
  vm_id TEXT,
  flag_user TEXT, -- Flag gerada para esta sessão
  flag_root TEXT, -- Flag gerada para esta sessão
  expires_at TIMESTAMPTZ NOT NULL, -- Auto-destroy time
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garante que um usuário só tenha uma instância ativa por vez
  CONSTRAINT unique_active_instance_per_user UNIQUE (user_id)
);

-- Tabela de Solves (Flags corretas)
CREATE TABLE public.solves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id TEXT REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  flag_type flag_type NOT NULL,
  submitted_flag TEXT NOT NULL,
  points_awarded INTEGER NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Evita pontuar a mesma flag duas vezes
  CONSTRAINT unique_solve UNIQUE (user_id, challenge_id, flag_type)
);

-- Tabela de Configurações VPN
CREATE TABLE public.vpn_configs (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  public_key TEXT NOT NULL,
  assigned_ip INET NOT NULL UNIQUE,
  config_content TEXT, -- Arquivo .conf gerado
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vpn_configs ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Users can see their own instances" ON public.active_instances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can see their own VPN config" ON public.vpn_configs FOR SELECT USING (auth.uid() = user_id);
