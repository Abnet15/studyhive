-- StudyHive MySQL schema (compatible with XAMPP / MariaDB 10.4+)
-- Run this script inside phpMyAdmin or the MySQL CLI.

DROP DATABASE IF EXISTS studyhive;
CREATE DATABASE studyhive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studyhive;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE departments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  faculty VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  department_id INT UNSIGNED,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  academic_year TINYINT UNSIGNED,
  role ENUM('student','moderator','admin') NOT NULL DEFAULT 'student',
  avatar_url VARCHAR(255),
  bio VARCHAR(280),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE courses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  department_id INT UNSIGNED,
  course_code VARCHAR(32) NOT NULL UNIQUE,
  course_name VARCHAR(160) NOT NULL,
  description TEXT,
  year_offered TINYINT UNSIGNED,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_courses_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE course_materials (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  uploader_id INT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  description TEXT,
  file_path VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(180),
  file_type VARCHAR(24),
  file_size BIGINT UNSIGNED,
  material_type ENUM('material','exam','project','note') NOT NULL DEFAULT 'material',
  storage_provider ENUM('local','s3','drive') NOT NULL DEFAULT 'local',
  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count INT UNSIGNED NOT NULL DEFAULT 0,
  downloads INT UNSIGNED NOT NULL DEFAULT 0,
  is_public TINYINT(1) NOT NULL DEFAULT 1,
  is_approved TINYINT(1) NOT NULL DEFAULT 1,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_material_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_material_uploader FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE,
  FULLTEXT KEY idx_materials_fulltext (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE material_reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  material_id BIGINT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_review_material_user (material_id, user_id),
  CONSTRAINT fk_review_material FOREIGN KEY (material_id) REFERENCES course_materials(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE material_downloads (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  material_id BIGINT UNSIGNED NOT NULL,
  user_id INT UNSIGNED,
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  CONSTRAINT fk_download_material FOREIGN KEY (material_id) REFERENCES course_materials(id) ON DELETE CASCADE,
  CONSTRAINT fk_download_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE favorites (
  user_id INT UNSIGNED NOT NULL,
  material_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, material_id),
  CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorite_material FOREIGN KEY (material_id) REFERENCES course_materials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE badges (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  description VARCHAR(255),
  icon VARCHAR(16),
  threshold_value INT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_badges (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  badge_id INT UNSIGNED NOT NULL,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_badge (user_id, badge_id),
  CONSTRAINT fk_user_badges_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_badges_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  body TEXT,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE password_resets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- Seed data ------------------------------------------------------------------

INSERT INTO departments (name, faculty) VALUES
('Computer Science', 'Engineering'),
('Electrical Engineering', 'Engineering'),
('Information Systems', 'Informatics');

INSERT INTO courses (department_id, course_code, course_name, description, year_offered, is_active)
VALUES
(1, 'CS301', 'Data Structures', 'Core algorithms & data structures', 2, 1),
(1, 'CS201', 'Computer Security', 'Foundations of cybersecurity', 2, 1),
(2, 'EE301', 'Digital Electronics', 'Digital systems and logic design', 3, 1),
(1, 'CS401', 'Algorithms', 'Advanced algorithm design', 3, 1),
(1, 'DB401', 'Database Systems', 'Relational databases and SQL', 2, 1);

INSERT INTO badges (code, name, description, icon, threshold_value)
VALUES
('FIRST_UPLOAD', 'First Upload', 'Uploaded your first resource', '🎉', 1),
('POPULAR_CONTRIBUTOR', 'Popular Contributor', 'Reached 100 downloads', '⭐', 100),
('TOP_RATED', 'Top Rated', 'Average rating above 4.5', '🏆', 45),
('HELPER', 'Helper', 'Helped 50+ students through downloads', '🤝', 50);

INSERT INTO users (department_id, full_name, email, password_hash, academic_year, role)
VALUES
(1, 'Admin', 'admin@studyhive.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZ2J0/.:Gu3zcaKxn6VOGGA/PWy7i', NULL, 'admin'),
(1, 'Alem', 'alem@example.com', '$2b$10$4h1jQzYduiH1l6NfrnDG2uPwSj2ZDu0kbPt.N0vXjaYkR5apArf5C', 3, 'student'),
(2, 'Sara', 'sara@example.com', '$2b$10$RV5zsxFrqF0a0zY4xXHzj.WK5ZS4nVrLOT9K6x6tEN84ImU8vzU6C', 2, 'student');

INSERT INTO course_materials (
  course_id, uploader_id, title, slug, description, file_path, original_file_name,
  file_type, file_size, material_type, downloads
) VALUES
(1, 2, 'CS301 Midterm 2023', 'cs301-midterm-2023', 'Past midterm with solutions', '/uploads/cs301-midterm.pdf', 'cs301-midterm.pdf', 'pdf', 524288, 'exam', 245),
(2, 3, 'EE201 Lab Notes', 'ee201-lab-notes', 'Weeks 1-4 comprehensive notes', '/uploads/ee201-lab-notes.pdf', 'ee201-lab-notes.pdf', 'pdf', 734003, 'material', 189);


