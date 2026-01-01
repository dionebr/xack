-- Inserir máquina Mitchell no banco de dados
INSERT INTO public.challenges (
    id,
    name,
    type,
    category,
    difficulty,
    description,
    estimated_time,
    points,
    image_id,
    config,
    is_active
) VALUES (
    'mitchell',
    'Mitchell',
    'docker',
    'web',
    'medium',
    'A vulnerable Tomcat server with multiple red herrings and privilege escalation via misconfigured cron job. Exploit the Manager App, find hidden flags, and escalate to root.',
    '90-120 minutes',
    50,
    'mitchell:latest',
    '{
        "id": "mitchell",
        "name": "Mitchell",
        "type": "docker",
        "category": "web",
        "difficulty": "medium",
        "estimated_time": "90-120 minutes",
        "image_build_path": ".",
        "expose_ports": [9090, 8080],
        "flags": {
            "user": "xack{Us3r_Fl4g_R3al_0n3_H3r3}",
            "root": "xack{R00t_4cc3ss_Gr4nt3d_Succ3ss}"
        },
        "hints": [
            "The Tomcat Manager is accessible on port 9090, not 8080",
            "Not all credentials in the system are valid - look for the real ones",
            "Check for writable scripts running as root",
            "Hidden files and directories might contain the real flags"
        ],
        "learning_objectives": [
            "Tomcat Manager exploitation",
            "WAR file upload attacks",
            "Linux privilege escalation via cron",
            "Enumeration and red herring identification"
        ]
    }'::jsonb,
    true
);
