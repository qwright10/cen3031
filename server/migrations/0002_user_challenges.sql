alter table "challenge" add column user_id uuid;
alter table "challenge" add constraint challenge_user_id_fkey foreign key ("user_id") references "account"("id");
