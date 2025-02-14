create extension if not exists pgcrypto;

create table if not exists "challenge" (
    id uuid not null default gen_random_uuid(),
    started_at timestamp without time zone not null default now(),
    challenge bytea not null default gen_random_bytes(32),
    username text unique not null,
    password text,

    constraint challenge_pkey primary key ("id")
);
