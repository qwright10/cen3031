begin transaction;
create extension if not exists citext;
alter table account add column username_ci citext;
update account set username_ci = username::citext;
alter table account drop column username;
alter table account rename column username_ci to username;
alter table account alter column username set not null;
commit;
