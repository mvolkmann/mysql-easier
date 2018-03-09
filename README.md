# mysql-easier

[![Build Status](https://secure.travis-ci.org/mvolkmann/mysql-easier.png)](http://travis-ci.org/mvolkmann/mysql-easier)

This is a Node module that makes it very simple
to interact with MySQL databases.
Fundamentally, it wraps Connection and Pool objects
from [mysql](https://www.npmjs.com/package/mysql) and
adds convenience methods for common tasks and interaction patterns.
It was inspired by [postgres-easy](https://github.com/mvolkmann/postgresql-easy).

Migrating from 1.x to 2.x?  See: [Migrating](#migrating-from-1x-to-2x)

## Installation

To install mysql-easier, run `npm install mysql-easier`

## General Use

```js
const mySqlEasier = require('mysql-easier');

// Configure the global pool
mySqlEasier.configure(config);

// Get a connection from the pool
const myConn = await mySqlEasier.getConnection();

// Do some database stuff

const newId = await myConn.insert('food', {name: 'Apple', color: 'Red'});

const aFruit = await myConn.getById('food', newId);
console.log(aFruit.name) // Output: Apple

await myConn.deleteById('food', newId);

// All done?  Release the connection
await myConn.done();

// App ready to exit?  Close the pool
await mySqlEasier.endPool();
```

## Pool and Connection Management

Let's break down the management of connections in mysql-easier.
Your index or main script in your application will likely configure your database pool:

```js
// Index or Main module
const mySqlEasier = require('mysql-easier');

mySqlEasier.configure(config);
```

At this point, mysql-easier will have created a global connection pool
for your database interactions using the configuration provided.
To get a connection from the pool (including from other modules):

```js
// Some other module
const mySqlEasier = require('mysql-easier');

const myConn = await mySqlEasier.getConnection();

// Do some database stuff

await myConn.done(); // Releases the connection back to the pool.
```

When you are done with your database interactions and ready to
close your application, you can close the global pool:

```js
await mySqlEasier.endPool();
```

If you would rather manage the connection pools yourself,
you can create your own.

```js
  const mySqlEasier = require('mysql-easier');

  const myPool = mySqlEasier.createPool(config);

  const myConn = await myPool.getConnection();

  // Do some database stuff

  await myConn.done();

  // Time to end the pool

  await myPool.end();
```

If you do not want to pool your connections at all and would rather control database access one connection at a time, you can do that too.

```js
  const mySqlEasier = require('mysql-easier');

  const myConn = mySqlEasier.createConnection(config);

  // Do some database stuff

  await myConn.done();
```

## Configuration

The config object in the methods above takes the same options as described in
the [mysql documentation](https://github.com/mysqljs/mysql#connection-options).
These include:

  * `acquireTimeout`: time before the connection is closed; default is 30000
  * `connectionLimit`: maximum number of concurrent connections; default is 10
  * `database`: the name of the database to use
  * `debug`: true to output messages describing each action; defaults to false
  * `host`: defaults to localhost
  * `password`: if database requires authentication
  * `queueLimit`: maximum number of queued connection requests; default is 0
  * `user`: if database requires authentication
  * `waitForConnections`: boolean that determines if connection requests
    should be queued if there are no available connections; default is true

The only option that is always required is "database".

## Demo

To run the demo code, follow these steps:
1) Start database daemon with `mysql.server start`
2) Start interactive mode with `mysql -uroot`
3) Create the demo database with `create database demo`
4) Select the database with `use demo`
5) Create a table with
```
   create table demo_user (
     id int auto_increment primary key,
     username text,
     password text
   );
```
6) Get list of tables `show tables;`
7) See description of newly created table with `describe demo_user;`
8) Exit interactive mode with `exit`.
9) Run the demo with `npm run demo`

## API

### MySqlEasier

This is a global object that represents the common use cases.
It is intended to be a singleton in a Node application to
allow various modules to share a single MySQL connection pool.

```js
const mySqlEasier = require('mysql-easier');
```

#### `configure`
Creates the global MySqlPool using the provided configuration.

```js
mySqlEasier.configure({
  host: 'localhost',
  user: 'myuser',
  password: 'super-secret'
});
```

#### `createConnection`
Creates a new MySqlConnection using a non-pooled connection
with the provided configuration.

This method should only be used if you intentionally
do not wish to use pooled connections.

When you are done with the connection, you should call `myConnection.done()`.

```js
const myConn = mySqlEasier.createConnection({
  host: 'localhost',
  user: 'myuser',
  password: 'super-secret'
});
```

#### `createPool`
Creates a new MySqlPool using the provided configuration.

This method can be used as an alternative to `configure`.
It may be useful if you would like to manage your connection pools yourself.
For example, if you require multiple simultaneous pools
to exist at the same time.

When you are done with the pool, you should call `myPool.end()`.

```js
const myPool = mySqlEasier.createPool({
  host: 'localhost',
  user: 'myuser',
  password: 'super-secret'
});
```

#### `endPool`
Ends the global pool if it was created using `configure`.

Once the pool has ended, any outstanding connections will cease to perform.
This should only be done when you are confident that the pool
is no longer necessary.

After you end the global pool, you can create a new one
by calling `mySqlEasier.configure(config)` again.

```js
try {
  await mySqlEasier.endPool();
} catch (err) {
  // Handle the error.
}
```

#### `getConnection`
Retrieves a MySqlConnection from the global pool.

Once you are done with the connection, call `myConnection.done()`
to release it back to the pool.

```js
try {
  const myConn = await mySqlEasier.getConnection();
} catch (err) {
  // Handle the error.
}
```

### MySqlConnection

This class wraps a 'Connection' from mysqljs as described here:
  + https://github.com/mysqljs/mysql#establishing-connections

The basic benefits it provides are:
  1. `query` and other database methods return promises
     instead of taking callbacks.
  2. Provides a number of convenience methods for interacting with tables
     that have an auto-incremented primary key named `id`.

If you need to do some more advanced operations (like
[streaming result rows](https://github.com/mysqljs/mysql#streaming-query-rows)),
you can access the [mysqljs](https://github.com/mysqljs/mysql) 'Connection'
by going directly to the `connection` property of this object.

Generally speaking, you will create a MySqlConnection directly
(but you can if you like).  You will usually get connections by:

  + `mySqlEasier.getConnection()` -- To grab a connection from the global pool.
  + `myPool.getConnection()` -- Where `myPool` is a MySqlPool from mysql-easier.

When you are done with the connection, call `myConnection.done()`.
If the connection is pooled, it will release the connection back to its pool.
If it is not, it will just 'end' the connection.

To create a MySqlConnection from an existing mysqljs Connection:

```js
const easierConnection = new MySqlConnection(baseConnection);
```

#### `deleteAll`
Deletes all records from a given table.

```js
try {
  await connection.deleteAll('flavors');
  // Do something after successful delete.
} catch (e) {
  // Handle the error.
}
```

#### `deleteById`
This deletes a record from a given table by id.
It requires the table to have a column named "id".

```js
try {
  await connection.deleteById('flavors', 7);
  // Do something after successful delete.
} catch (e) {
  // Handle the error.
}
```

#### `destroy`
Destroy the wrapped connection.
This stops all communication with the database on this connection.
If the connection is pooled, the pool will create a new connection
to take its place.

Generally speaking, you should use `connection.done()` instead.

```js
connection.destroy();
```

#### `done`
Ends this instances interactions with the database.

This should be called when you are done using the connection.
If it is a pooled connection, it will release the connection back to the pool.
If it isn't, it will `end` the connection.

```js
try {
  await connection.done();
} catch (e) {
  // Handle the error
}
```

#### `getAll`
This gets all records from a given table.

```js
try {
  const rows = await connection.getAll('flavors');
  // Process data in the array rows.
} catch (e) {
  // Handle the error.
}
```

#### `getById`
This gets a record from a given table by id.
It requires the table to have a column named "id".

```js
try {
  const rows = await connection.getById('flavors', 7);
  // Process data in the result.
} catch (e) {
  // Handle the error.
}
```

#### `insert`
This inserts a record into a given table and returns the id of the new record.
The keys of obj are column names and their values are the values to insert.
This assumes that the table has a column named `id` that is auto_increment.

```js
try {
  const newId = await connection.insert(
    'flavors', {name: 'vanilla', calories: 100});
  // Do something after successful insert.
  // newId will be the id of the newly-inserted row.
} catch (e) {
  // Handle the error.
}
```

#### `query`
This executes a SQL query.
It is the most general purpose function provided.
It is used by several of the other functions.

```js
try {
  const rows = await connection.query(
    'select name from flavors where calories < 150');
  // Process data in the array rows.
} catch (e) {
  // Handle the error.
}

try {
  const sql = 'select name from flavors where calories < ? and cost < ?';
  const rows = await connection.query(sql, 200, 3);
  // Process data in the array rows.
} catch (e) {
  // Handle the error.
}
```

#### `transaction`
This executes a given function inside a transaction.
This function can call other functions in this API to perform database operations.
The function must return a promise to indicate when it has completed (`resolve`)
or when an error has occurred (`reject`).
If the function throws an error or rejects, the transaction is rolled back.
Otherwise, it is committed.

```js
try {
  await connection.transaction(someFunction);
  // Do more work after the transaction commits.
} catch (e) {
  // Handle the error.
}
```

```js
try {
  await connection.transaction(async () => {
    const id = await connection.insert(
      'flavors', {name: 'vanilla', calories: 100});

    // If the next insert fails, the entire transaction (including the previous
    // insert) will rollback.
    await connection.insert('flavor_rating', {flavorId: id, rating: 'Boring'});
  });
  // Do more work after the transaction commits.
} catch (e) {
  // Handle the error.
}
```

#### `updateById`
This updates a record in a given table by id.
It requires the table to have a column named "id".

```js
try {
  const rows = await connection.updateById(
    'flavors', 7, {name: 'chocolate', calories: 200});
  // Process data in the array rows which contains the updated rows.
} catch (e) {
  // Handle the error.
}
```

#### `upsert`
This is like `insert`, but if the row already exists, it is updated.
It returns the id of the new or existing record.
The keys of obj are column names and their values are the values to insert.
This assumes that the table has a column named `id` that is auto_increment.

```js
try {
  const newId = await mysql.upsert(
    'flavors', {name: 'vanilla', calories: 100});
  // Do something after successful upsert.
  // newId will be the id of the new or exising row.
} catch (e) {
  // Handle the error.
}
```

### MySqlPool
This class wraps a 'Pool' from mysqljs as described here:
  + https://github.com/mysqljs/mysql#pooling-connections

The basic benefits it provides are:
  1. Functions use Promises instead of callbacks
  2. Connections that are created are instances of our own MySqlConnection
     which provides convenience methods for common database operations.

If you require additional control, you can access the mysqljs 'Pool'
by going directly to the `pool` property of this object.

In most situations, we suspect that you will be using the global pool
instead of interacting with this class.

To create a new pool:

```js
const myPool = new MySqlPool(config);
```

#### `end`
End this pool.
After the end operation is complete, connections that were
retrieved from this pool will no longer function.

```js
try {
  await myPool.end();
} catch (err) {
  // Handle the error.
}
```

#### `getConnection`
Retrieve a MySqlConnection from this pool.

When you are done with the connection, call `myConnection.done()`
to release it back to the pool.

```js
try {
  const myConn = await myPool.getConnection();
} catch (err) {
  // Handle the error.
}
```

## Migrating from 1.x to 2.x

If you are coming from mysql-easier 1.x
there are a few things you need to know.

### Getting connections

The way you get connections has fundamentally changed.
In 1.x, you would have done something like:
```js
const MySqlConnection = require('mysql-easier');
const connection = new MySqlConnection(config);
```

In 2.x we introduced a global connection pool.
Most users will now get connections like this:
```js
const mySqlEasier = require('mysql-easier');
mySqlEasier.configure(config);

const connection = await mySqlEasier.getConnection();
```

The MySqlConnection that is returned is mostly the same as the API,
but differs in the connection is ended.

### Getting a [mysqljs](https://github.com/mysqljs/mysql) Connection

In 1.x if you needed access to the connection instance as provided my 'mysql',
you would request one this way:

```js
const baseConnection = await easierConnection.getConnection();
```

In 2.x you can just access the `connection` property directly:

```js
const baseConnection = easierConnection.connection;
```

### Ending a connection

In 1.x a MySqlConnection was ended with the `disconnect` method:

```js
  const connection = new MySqlConnection(config);

  // Do some database stuff.

  connection.disconnect();
```

In 2.x, connections are closed by calling the `done` method
and the global pool is closed by calling `endPool`.

```js
  const connection = await mySqlEasier.getConnection();

  // Do some database stuff.

  await connection.done();

  // Do other things.  Time to exit the application.

  await mySqlEasier.endPool();
```

Both `connection.done()` and `mySqlEasier.endPool()` return a `Promise`.
In most cases, there is no need to `await`
the `Promise` returned from `connection.done()`
unless you want to verify that the connection is released
or closed successfully.
Likewise, Node will not cleanly exit your application
if the pool is still running, so you don't need to
`await` the `Promise` from `mySqlEasier.endPool()`
unless you want to make sure that it exits cleanly.
