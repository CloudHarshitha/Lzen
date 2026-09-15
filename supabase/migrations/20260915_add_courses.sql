-- courses table: stores each user's courses with full metadata
CREATE TABLE IF NOT EXISTS courses (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          VARCHAR(255) NOT NULL,
    code          VARCHAR(50) NOT NULL,
    internals     INTEGER NOT NULL DEFAULT 0,
    externals     INTEGER NOT NULL DEFAULT 0,
    syllabus      TEXT DEFAULT '',
    total_units   INTEGER NOT NULL DEFAULT 1,
    course_type   VARCHAR(50) DEFAULT 'theory_joint',
    raw_exam_max  INTEGER DEFAULT 75,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
