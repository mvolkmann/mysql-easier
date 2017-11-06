use demo;

drop table if exists demo_user;

create table demo_user (
  id int auto_increment primary key,
  username text,
  password text,
  company text,
  active bool
);
