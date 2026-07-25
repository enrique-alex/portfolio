-- Migration 0002 : séparation du contenu traduisible (FR/EN) du contenu partagé
-- Pattern de recréation de table (plus fiable que ALTER TABLE DROP COLUMN sur D1)

CREATE TABLE projects_new (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    technologies TEXT NOT NULL DEFAULT '[]',
    theme_color_r INTEGER NOT NULL,
    theme_color_g INTEGER NOT NULL,
    theme_color_b INTEGER NOT NULL,
    github_url TEXT,
    cover_image TEXT,
    gallery TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO projects_new (id, slug, year, technologies, theme_color_r, theme_color_g, theme_color_b, github_url, cover_image, gallery, sort_order, created_at, updated_at)
SELECT id, slug, year, technologies, theme_color_r, theme_color_g, theme_color_b, github_url, cover_image, gallery, sort_order, created_at, updated_at
FROM projects;

DROP TABLE projects;

ALTER TABLE projects_new RENAME TO projects;

CREATE TABLE project_translations (
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    locale TEXT NOT NULL CHECK (locale IN ('fr', 'en')),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    short_description TEXT NOT NULL,
    detailed_description TEXT NOT NULL,
    technical_challenges TEXT NOT NULL,
    impact TEXT NOT NULL,
    PRIMARY KEY (project_id, locale)
);

CREATE INDEX idx_project_translations_project_id ON project_translations(project_id);
