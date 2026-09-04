-- Aurora Studio — deck persistence (Hostinger MySQL)
-- Run once in phpMyAdmin or mysql CLI

CREATE TABLE IF NOT EXISTS aurora_decks (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  owner_key VARCHAR(64) NOT NULL DEFAULT 'default',
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled deck',
  ast JSON NOT NULL,
  ast_version TINYINT UNSIGNED NOT NULL DEFAULT 1,
  theme_id VARCHAR(64) NOT NULL DEFAULT 'noir',
  slide_count INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_owner_updated (owner_key, updated_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS aurora_deck_versions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  deck_id VARCHAR(32) NOT NULL,
  ast JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_deck_created (deck_id, created_at DESC),
  CONSTRAINT fk_versions_deck FOREIGN KEY (deck_id) REFERENCES aurora_decks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
