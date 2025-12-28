-- Habilitar Realtime para a tabela direct_messages
-- Isso permite que mensagens sejam recebidas instantaneamente

ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
