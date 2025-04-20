create table if not exists quiz_attempt (
    id serial primary key,
    quiz_id uuid not null references quiz(id),
    account_id uuid not null references account(id),
    timestamp timestamptz default now()
);

create table if not exists question_attempt (
    id serial primary key,
    attempt_id integer not null references quiz_attempt(id),
    question_id uuid not null references question(id),
    response int[] not null
);

create or replace view scored_question_attempt as
    select
        question_attempt.*,
        (question_attempt.response = question.answers) as is_correct
    from question_attempt
    inner join question
        on question.id = question_attempt.question_id;

create or replace view scored_quiz_attempt as
select
    quiz_attempt.*,
    avg(case when is_correct = true then 1 else 0 end) as score
    from quiz_attempt
    inner join scored_question_attempt on scored_question_attempt.attempt_id = quiz_attempt.id
group by quiz_attempt.id;
