-- create `question_type` if not exists
do $$ begin
create type "question_type" as enum ('multiple_choice', 'multiple_select', 'true_false');
exception
    when duplicate_object then null;
end $$;

create table if not exists "account" (
    id uuid not null default gen_random_uuid(),
    username text unique not null,
    email_hash text unique nulls distinct,
    password text,
    is_email_verified bool not null default false,

    constraint "account_pkey" primary key ("id")
);


create table if not exists "credential" (
    id bytea not null,
    user_id uuid not null,
    type text not null,
    sign_count int not null,
    uv_initialized bool not null,
    transports text[] not null,
    backup_eligible bool not null,
    backup_state bool,
    jwt json,

    constraint "credential_pkey" primary key ("id"),
    constraint "credential_user_id_fkey" foreign key ("user_id") references "account"("id")
        on delete restrict on update cascade
);

create table if not exists "quiz" (
    id uuid not null default gen_random_uuid(),
    owner_id uuid not null,
    name text not null,
    is_private bool not null,

    constraint "quiz_pkey" primary key ("id"),
    constraint "quiz_owner_id_fkey" foreign key ("owner_id") references "account"("id")
        on delete restrict on update cascade
);

create table if not exists question (
    id uuid not null default gen_random_uuid(),
    quiz_id uuid not null,
    type question_type not null,
    prompt text not null,
    choices text[],
    answers int[] not null,

    constraint "question_pkey" primary key ("id"),
    constraint "question_quiz_id_fkey" foreign key ("quiz_id") references "quiz"("id")
        on delete cascade on update cascade,
    constraint "answers_exist" check ( "choices" is null or (array_length("choices", 1) > all("answers")) )
    );
