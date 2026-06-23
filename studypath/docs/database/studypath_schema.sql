-- ============================================================
-- StudyPath — Schema MySQL 8.0
-- Repositório: github.com/mindrodr/studypath-vestibular
-- Arquivo: docs/database/studypath_schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS studypath
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE studypath;

-- ------------------------------------------------------------
-- Tabela: users
-- ------------------------------------------------------------
CREATE TABLE users (
  id          CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  name        VARCHAR(120)  NOT NULL,
  email       VARCHAR(200)  NOT NULL UNIQUE,
  password    VARCHAR(255),
  provider    ENUM('local', 'google') NOT NULL DEFAULT 'local',
  role        ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  target_exam VARCHAR(50)   COMMENT 'Ex: ENEM, FUVEST, UNICAMP',
  target_date DATE          COMMENT 'Data da prova alvo',
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- ------------------------------------------------------------
-- Tabela: plans
-- ------------------------------------------------------------
CREATE TABLE plans (
  id          INT           PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(60)   NOT NULL,
  price_cents INT           NOT NULL DEFAULT 0 COMMENT 'Preço em centavos',
  billing     ENUM('free', 'monthly', 'yearly') NOT NULL DEFAULT 'monthly',
  features    JSON          COMMENT 'Lista de features do plano',
  active      BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dados iniciais dos planos
INSERT INTO plans (name, price_cents, billing, features) VALUES
  ('Básico',        0,     'free',    '["cronograma","questoes_limitadas","flashcards"]'),
  ('Premium',       2990,  'monthly', '["tudo_basico","simulados","relatorio_pdf","ia","questoes_ilimitadas"]'),
  ('Institucional', 49900, 'monthly', '["tudo_premium","gestao_turmas","relatorios_institucionais","suporte_prioritario"]');

-- ------------------------------------------------------------
-- Tabela: subscriptions
-- ------------------------------------------------------------
CREATE TABLE subscriptions (
  id                   CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  user_id              CHAR(36)  NOT NULL,
  plan_id              INT       NOT NULL,
  status               ENUM('active', 'canceled', 'past_due') NOT NULL DEFAULT 'active',
  stripe_sub_id        VARCHAR(100) COMMENT 'ID da assinatura no Stripe',
  current_period_start DATETIME,
  current_period_end   DATETIME,
  created_at           DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id),
  INDEX idx_user_sub (user_id),
  INDEX idx_status (status)
);

-- ------------------------------------------------------------
-- Tabela: schedules
-- ------------------------------------------------------------
CREATE TABLE schedules (
  id           CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  user_id      CHAR(36)  NOT NULL,
  week_start   DATE      NOT NULL,
  week_end     DATE      NOT NULL,
  generated_at DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_week (user_id, week_start)
);

-- ------------------------------------------------------------
-- Tabela: schedule_sessions
-- ------------------------------------------------------------
CREATE TABLE schedule_sessions (
  id              CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  schedule_id     CHAR(36)     NOT NULL,
  subject         VARCHAR(60)  NOT NULL,
  topic           VARCHAR(120),
  day_of_week     TINYINT      NOT NULL COMMENT '0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab',
  planned_minutes INT          NOT NULL DEFAULT 60,
  completed       BOOLEAN      NOT NULL DEFAULT FALSE,
  completed_at    DATETIME,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  INDEX idx_schedule (schedule_id)
);

-- ------------------------------------------------------------
-- Tabela: questions
-- ------------------------------------------------------------
CREATE TABLE questions (
  id          CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  subject     VARCHAR(60)   NOT NULL,
  topic       VARCHAR(120),
  exam_board  ENUM('ENEM', 'FUVEST', 'UNICAMP', 'UNESP', 'outras') NOT NULL DEFAULT 'ENEM',
  year        SMALLINT,
  statement   TEXT          NOT NULL,
  option_a    VARCHAR(500)  NOT NULL,
  option_b    VARCHAR(500)  NOT NULL,
  option_c    VARCHAR(500)  NOT NULL,
  option_d    VARCHAR(500)  NOT NULL,
  option_e    VARCHAR(500),
  answer      CHAR(1)       NOT NULL COMMENT 'a, b, c, d ou e',
  difficulty  ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_subject_board (subject, exam_board),
  INDEX idx_difficulty (difficulty)
);

-- ------------------------------------------------------------
-- Tabela: user_answers
-- ------------------------------------------------------------
CREATE TABLE user_answers (
  id          CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36)  NOT NULL,
  question_id CHAR(36)  NOT NULL,
  chosen      CHAR(1)   NOT NULL,
  is_correct  BOOLEAN   NOT NULL,
  answered_at DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_user_answers (user_id, answered_at),
  INDEX idx_user_subject (user_id, question_id)
);

-- ------------------------------------------------------------
-- Tabela: topics_progress
-- ------------------------------------------------------------
CREATE TABLE topics_progress (
  id         CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  user_id    CHAR(36)     NOT NULL,
  subject    VARCHAR(60)  NOT NULL,
  topic      VARCHAR(120) NOT NULL,
  status     ENUM('pending', 'reviewing', 'mastered') NOT NULL DEFAULT 'pending',
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_topic (user_id, subject, topic),
  INDEX idx_user_subject_prog (user_id, subject)
);

-- ------------------------------------------------------------
-- Views úteis
-- ------------------------------------------------------------

-- View: desempenho por matéria de cada usuário
CREATE VIEW vw_user_performance AS
SELECT
  ua.user_id,
  q.subject,
  COUNT(*)                                        AS total_answers,
  SUM(ua.is_correct)                              AS correct_answers,
  ROUND(SUM(ua.is_correct) / COUNT(*) * 100, 1)  AS accuracy_pct
FROM user_answers ua
JOIN questions q ON q.id = ua.question_id
GROUP BY ua.user_id, q.subject;

-- View: progresso do cronograma da semana
CREATE VIEW vw_schedule_progress AS
SELECT
  s.user_id,
  s.week_start,
  COUNT(ss.id)              AS total_sessions,
  SUM(ss.completed)         AS completed_sessions,
  ROUND(
    SUM(ss.completed) / COUNT(ss.id) * 100, 1
  )                         AS completion_pct
FROM schedules s
JOIN schedule_sessions ss ON ss.schedule_id = s.id
GROUP BY s.user_id, s.week_start;
