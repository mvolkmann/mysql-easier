drop database if exists demo;
create database demo;
use demo;

create table demo_user (
  id int auto_increment primary key,
  username text,
  password text,
  company text,
  active bool,
  small bit(1)
);
