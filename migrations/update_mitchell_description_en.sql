-- Add English description for Mitchell challenge
UPDATE challenges
SET description = 'A vulnerable Tomcat server with multiple red herrings and privilege escalation via misconfigured cron job. Explore the Manager App, find hidden flags and escalate to root.'
WHERE name = 'Mitchell';
