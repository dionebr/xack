-- Update Mitchell challenge flags in config JSON
UPDATE challenges
SET config = jsonb_set(
  jsonb_set(
    COALESCE(config, '{}'::jsonb),
    '{flags,user}',
    '"XACK{a8f5f167f44f4964e6c998dee827110c}"'
  ),
  '{flags,root}',
  '"XACK{c4ca4238a0b923820dcc509a6f75849b}"'
)
WHERE name = 'Mitchell';
