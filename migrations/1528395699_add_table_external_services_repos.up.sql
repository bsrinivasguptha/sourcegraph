BEGIN;

CREATE TABLE IF NOT EXISTS external_service_repos (
    external_service_id bigint NOT NULL,
    repo_id integer NOT NULL,
    clone_url text NOT NULL,

    FOREIGN KEY (external_service_id) REFERENCES external_services(id) ON DELETE CASCADE DEFERRABLE,
    FOREIGN KEY (repo_id) REFERENCES repo(id) ON DELETE CASCADE DEFERRABLE
);

-- Migrate repo.sources column content to the external_service_repos table.
-- Each repo.sources value is a jsonb containing one or more source.
-- Each source must be extracted as a single row in the external_service_repos table.

DO $$
DECLARE
   _key   text;
   _value text;
   _repo_id integer;
   _sources jsonb;
BEGIN
    FOR _repo_id, _sources IN
        SELECT id, sources FROM repo
    LOOP
        FOR _key, _value IN
            SELECT * FROM jsonb_each_text(_sources)
        LOOP
            INSERT INTO external_service_repos (external_service_id, repo_id, clone_url)
            VALUES (
                split_part((_value::jsonb->'ID'#>>'{}')::text, ':', 3)::bigint,
                _repo_id,
                _value::jsonb->'CloneURL'#>>'{}'
            );
        END LOOP;
    END LOOP;
END$$;

ALTER TABLE repo DROP COLUMN IF EXISTS sources;

COMMIT;
