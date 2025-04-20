alter table quiz alter column created_at type timestamptz;
alter table quiz alter column created_at set default now();
