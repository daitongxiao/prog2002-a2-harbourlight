-- Replace the placeholder with a strong, local password before executing.
-- This account intentionally has SELECT only.
CREATE USER IF NOT EXISTS 'harbourlight_reader'@'localhost' IDENTIFIED BY 'REPLACE_WITH_LOCAL_PASSWORD';
CREATE USER IF NOT EXISTS 'harbourlight_reader'@'127.0.0.1' IDENTIFIED BY 'REPLACE_WITH_LOCAL_PASSWORD';
GRANT SELECT ON charityevents_db.* TO 'harbourlight_reader'@'localhost';
GRANT SELECT ON charityevents_db.* TO 'harbourlight_reader'@'127.0.0.1';
