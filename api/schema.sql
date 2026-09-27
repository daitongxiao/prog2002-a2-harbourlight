CREATE DATABASE IF NOT EXISTS charityevents_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE charityevents_db;

CREATE TABLE IF NOT EXISTS organisations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS events (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  organisation_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  start_at_utc DATETIME NOT NULL,
  end_at_utc DATETIME NOT NULL,
  start_local_date DATE NOT NULL COMMENT 'Australia/Sydney calendar date of start_at_utc',
  venue VARCHAR(160) NOT NULL,
  city VARCHAR(100) NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  ticket_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  fundraising_goal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  amount_raised DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  image_path VARCHAR(255) NULL,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_events_organisation FOREIGN KEY (organisation_id) REFERENCES organisations(id),
  CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT chk_events_time CHECK (end_at_utc > start_at_utc),
  CONSTRAINT chk_events_money CHECK (ticket_price >= 0 AND fundraising_goal >= 0 AND amount_raised >= 0),
  INDEX idx_events_public (is_suspended, end_at_utc, start_at_utc),
  INDEX idx_events_filters (start_local_date, category_id, city)
) ENGINE=InnoDB;

-- Run create_reader.sql separately as a MySQL administrator after setting a real local password.
