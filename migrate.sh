#!/bin/bash

liquibase \
  --driver=com.mysql.jdbc.Driver \
  --classpath="./mysql-connector-java-5.0.8-bin.jar" \
  --changeLogFile=changelog.xml \
  --url="jdbc:mysql://localhost/demo" \
  --username=root \
  migrate

