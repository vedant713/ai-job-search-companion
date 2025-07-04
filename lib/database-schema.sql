-- MySQL Database Schema for AI Job Assistant

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    status ENUM('Applied', 'Interviewing', 'Offer', 'Rejected') DEFAULT 'Applied',
    date_applied DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Skills table
CREATE TABLE skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    proficiency INT CHECK (proficiency >= 0 AND proficiency <= 100),
    target_proficiency INT CHECK (target_proficiency >= 0 AND target_proficiency <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, skill_name)
);

-- Tasks table
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    description TEXT NOT NULL,
    due_date DATE,
    is_complete BOOLEAN DEFAULT FALSE,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    tags TEXT, -- JSON array of tags
    context TEXT, -- Additional context about the task
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI Queries table
CREATE TABLE ai_queries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    query_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    context VARCHAR(255), -- Context category (resume, interview, etc.)
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_date_applied ON applications(date_applied);

CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_proficiency ON skills(proficiency);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_is_complete ON tasks(is_complete);
CREATE INDEX idx_tasks_priority ON tasks(priority);

CREATE INDEX idx_ai_queries_user_id ON ai_queries(user_id);
CREATE INDEX idx_ai_queries_timestamp ON ai_queries(timestamp);

-- Sample data insertion
INSERT INTO users (name, email, password_hash) VALUES 
('John Doe', 'john@example.com', '$2b$10$hashedpassword'),
('Jane Smith', 'jane@example.com', '$2b$10$hashedpassword');

INSERT INTO applications (user_id, company, role, status, date_applied, notes) VALUES 
(1, 'Google', 'Senior Frontend Developer', 'Interviewing', '2024-01-15', 'Technical interview scheduled'),
(1, 'Microsoft', 'Full Stack Engineer', 'Applied', '2024-01-12', 'Applied through LinkedIn'),
(1, 'Amazon', 'Software Development Engineer', 'Offer', '2024-01-08', 'Offer received, negotiating salary');

INSERT INTO skills (user_id, skill_name, proficiency, target_proficiency) VALUES 
(1, 'React', 85, 90),
(1, 'TypeScript', 75, 85),
(1, 'Node.js', 70, 80),
(1, 'Python', 60, 75),
(1, 'AWS', 45, 70);

INSERT INTO tasks (user_id, description, due_date, priority, tags, context) VALUES 
(1, 'Follow up with Google recruiter', '2024-01-20', 'High', '["Google", "Follow-up", "Interview"]', 'Software Engineer position at Google'),
(1, 'Prepare for Amazon technical interview', '2024-01-22', 'High', '["Amazon", "Interview", "Technical"]', 'System design round preparation');
