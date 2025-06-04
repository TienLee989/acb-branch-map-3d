docker exec -it acb-branch-map-3d-db-1 psql -U admin -d GIS

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE gis_branchs (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    operator        TEXT,
    type            TEXT CHECK (type IN ('PGD', 'HO')),
    category        TEXT,
    address         TEXT,
    phone           TEXT,
    email           TEXT,
    website         TEXT,
    time            TEXT,
    tags            JSONB,
    image           TEXT,
    icon            TEXT,
    geom            GEOMETRY(GEOMETRY, 4326),
    embedding       TEXT
);
-- all-MiniLM-L6-v2 384 chiều
CREATE INDEX idx_geom_gist ON gis_branchs USING gist (geom);
CREATE INDEX idx_name_gin ON gis_branchs USING gin (to_tsvector('simple', name));
CREATE INDEX idx_embedding_cosine ON gis_branchs USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
\dt branchs




