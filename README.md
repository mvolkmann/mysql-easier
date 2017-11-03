This is a Node module that makes it very simple
to interact with MySQL databases.

To install this, run `npm install -S mysql-easier`

To use this,
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
* `queueLimit`: maximum number of queuedconnection requests; default is 0
* `user`: if database requires authentication
* `waitForConnections`: boolean that determines if connection requests
*   should be queued if there are no available connections; default is true

The only one of these that is always required is "database".

MySqlConnection objects provide seven methods.
All but `disconnect` return a promise.
One way to use the returned promise is to chain calls to `then` and `catch`.
Another is to use `async` and `await`.

## `deleteAll`
This deletes all records from a given table.

```js
mysql.deleteAll('flavors')
  .then(() => {
    // Do something after successful delete.
  })
  .catch(err => {
    // Handle the error.
  });
```

## `deleteById`
This deletes a record from a given table by id.
It requires the table to have a column named "id".

```js
mysql.delete('flavors', 7)
  .then(() => {
    // Do something after successful delete.
  })
  .catch(err => {
    // Handle the error.
  });
```

## `disconnect`
This disconnects from the database.

```js
mysql.disconnect();
```

## `getAll`
This gets all records from a given table.

```js
mysql.getAll('flavors')
  .then(result => {
    // Process data in the array result.rows.
  })
  .catch(err => {
    // Handle the error.
  });
```

## `getById`
This gets a record from a given table by id.
It requires the table to have a column named "id".

```js
mysql.getById('flavors', 7)
  .then(result => {
    // Process data in the array result.rows.
  })
  .catch(err => {
    // Handle the error.
  });
```

## `insert`
This inserts a record into a given table
and returns the id of the new record.
The keys of obj are column names
and their values are the values to insert.
This assumes that the table has a column
named `id` that is autoincrement.

```js
mysql.insert('flavors', {name: 'vanilla', calories: 100})
  .then(result => {
    // Do something after successful insert.
    // result.rows[0] will be an object describing the inserted row.
  })
  .catch(err => {
    // Handle the error.
  });
```

## `query`
This executes a SQL query.
It is the most general purpose function provided.
It is used by several of the other functions.

```js
mysql.query('select name from flavors where calories < 150')
  .then(result => {
    // Do something with the result set in result.rows.
  })
  .catch(err => {
    // Handle the error.
  });

const sql = 'select name from flavors where calories < $1 and cost < $2';
mysql.query(sql, 200, 3)
  .then(result => {
    // Do something with the result set in result.rows.
  })
  .catch(err => {
    // Handle the error.
  });
```

## `updateById`
This updates a record in a given table by id.
It requires the table to have a column named "id".

```js
mysql.updateById('flavors', 7, {name: 'chocolate', calories: 200})
  .then(result => {
    // Do something with the result set in result.rows.
    // result.rows[0] will be an object describing the updated row.
  })
  .catch(err => {
    // Handle the error.
  });
```
