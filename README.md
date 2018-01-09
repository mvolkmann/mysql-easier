# mysql-easier

[![Build Status](https://secure.travis-ci.org/mvolkmann/mysql-easier.png)](http://travis-ci.org/mvolkmann/mysql-easier)

This is a Node module that makes it very simple
to interact with MySQL databases.
It has the same API as https://github.com/mvolkmann/postgresql-easy.

To install this, run `npm install -S mysql-easier`

## Setup

```js
const MySqlConnection = require('mysql-easier');
const mysql = new MySqlConnection(config);
```

The config object can contain these properties:
* `acquireTimeout`: time before the connection is closed; default is 30000
* `connectionLimit`: maximum number of concurrent connections; default is 10
* `database`: the name of the database to use
* `debug`: true to output messages describing each action; defaults to false
* `host`: defaults to localhost
* `password`: if database requires authentication
* `queueLimit`: maximum number of queued connection requests; default is 0
* `user`: if database requires authentication
* `waitForConnections`: boolean that determines if connection requests should be queued if there are no available connections; default is true

The only one of these that is always required is "database".

## Demo

To run the demo code, follow these steps:
1) Start database daemon with `mysql.server start`
2) Start interactive mode with `mysql -uroot`
3) Create the demo database with `create database demo`
4) Select the database with `use demo`
5) Create a table with
   create table demo_user (
     id int auto_increment primary key,
     username text,
     password text
   );
6) Get list of tables `show tables;`
7) See description of newly created table with `describe demo_user;`
8) Exit interactive mode with `exit`.
9) Run the demo with `npm run demo`

## API

MySqlConnection objects provide seven methods.
All but `disconnect` return a promise.
One way to use the returned promise is to chain calls to `then` and `catch`.
Another is to use `async` and `await`.

## `deleteAll`
This deletes all records from a given table.

```js
try {
  const mysql.deleteAll('flavors');
  // Do something after successful delete.
} catch (e) {
  // Handle the error.
}
```

## `deleteById`
This deletes a record from a given table by id.
It requires the table to have a column named "id".

```js
try {
  await mysql.delete('flavors', 7);
  // Do something after successful delete.
} catch (e) {
  // Handle the error.
}
```

## `disconnect`
This disconnects from the database.

```js
mysql.disconnect();
```

## `getAll`
This gets all records from a given table.

```js
try {
  const rows = await mysql.getAll('flavors');
  // Process data in the array rows.
} catch (e) {
  // Handle the error.
}
```

## `getById`
This gets a record from a given table by id.
It requires the table to have a column named "id".

```js
try {
  const rows = await mysql.getById('flavors', 7);
  // Process data in the array rows.
} catch (e) {
  // Handle the error.
}
```

## `getConnection`
This gets a connection to the database.
It is only useful for stepping outside the API
of this library and directly using the API of the mysql library on which this one is based.

```js
try {
  const connection = await mysql.getConnection();
  // Use the connection.
} catch (e) {
  // Handle the error.
}
```

## `insert`
This inserts a record into a given table
and returns the id of the new record.
The keys of obj are column names
and their values are the values to insert.
This assumes that the table has a column
named `id` that is auto_increment.

```js
try {
  const newId = await mysql.insert('flavors', {name: 'vanilla', calories: 100});
  // Do something after successful insert.
  // newId will be the id of the newly-inserted row.
} catch (e) {
  // Handle the error.
}
```

## `query`
This executes a SQL query.
It is the most general purpose function provided.
It is used by several of the other functions.

```js
try {
  const rows = await mysql.query('select name from flavors where calories < 150');
  // Process data in the array rows.
} catch (e) {
  // Handle the error.
}

try {
  const sql = 'select name from flavors where calories < $1 and cost < $2';
  const rows = await mysql.query(sql, 200, 3);
  // Process data in the array rows.
} catch (e) {
  // Handle the error.
}
```

## `releaseConnection`
This releases the current connection to the database.
This would typically only be used if `getConnection`
is also being used.

```js
mysql.releaseConnection();
```

## `transaction`
This executes a given function inside a transaction.
This function can call other functions in this API
to perform database operations.
The function must return a promise to indicate
when it has completed (`resolve`)
or when an error has occurred (`reject`).
If the function throws an error or rejects,
the transaction is rolled back.
Otherwise it is committed.

```js
try {
  await mysql.transaction(someFunction);
  // Do more work after the transaction commits.
} catch (e) {
  // Handle the error.
}
```

## `updateById`
This updates a record in a given table by id.
It requires the table to have a column named "id".

```js
try {
  const rows = await mysql.updateById('flavors', 7, {name: 'chocolate', calories: 200});
  // Process data in the array rows which contains the updated rows.
} catch (e) {
  // Handle the error.
}
```
