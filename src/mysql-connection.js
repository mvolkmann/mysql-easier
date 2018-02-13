const SqlUtil = require('./sql-util');

class MySqlConnection {
  /**
   * This configures a MySQL connection pool.
   * The object created can be used to interact with a given database.
   *
   * To use this,
   * const MySqlConnection = require('mysql-easier');
   * const mysql = new MySqlConnection(config);
   *
   * The config object can contain these properties:
   *   acquireTimeout: time before the connection is closed; default is 30000
   *   connectionLimit: maximum number of concurrent connections; default is 10
   *   database: the name of the database to use
   *   debug: true to output messages describing each action; defaults to false
   *   host: defaults to localhost
   *   password: if database requires authentication
   *   queueLimit: maximum number of queued connection requests; default is 0
   *   user: if database requires authentication
   *   waitForConnections: boolean that determines if connection requests
   *   should be queued if there are no available connections; default is true
   *
   * The only one of these that is always required is "database".
   */
  constructor(connection, config) {
    const debug = config && config.debug;
    this.connection = connection;
    this.sqlUtil = new SqlUtil(debug);
  }

  /**
   * Deletes all records from a given table.
   */
  deleteAll(tableName) {
    const sql = this.sqlUtil.deleteAll(tableName);
    return this.query(sql);
  }

  /**
   * Deletes a record from a given table by id.
   * This requires the table to have a column named "id".
   */
  deleteById(tableName, id) {
    const sql = this.sqlUtil.deleteById(tableName, id);
    return this.query(sql, id);
  }

  destroy() {
    if (this.connection) {
      this.connection.destroy();
      this.connection = null;
    }
  }

  /**
   * Connection is no longer needed.
   */
  done() {
    const conn = this.connection;
    this.connection = null;

    if (!conn) {
      return Promise.resolve();
    }

    if (typeof conn.release === 'function') {
      try {
        conn.release();
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    }

    if (typeof conn.end === 'function') {
      return new Promise((resolve, reject) => {
        conn.end(err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    // Technically, if this is true, one of the methods above
    // should have been available and we wouldn't get here.
    if (typeof conn.destroy === 'function') {
      try {
        conn.destroy();
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject('Unrecognizable connection type.');
  }

  /**
   * Gets all records from a given table.
   */
  getAll(tableName) {
    const sql = this.sqlUtil.getAll(tableName);
    return this.query(sql);
  }

  /**
   * Gets a record from a given table by id.
   * This requires the table to have a column named "id".
   */
  async getById(tableName, id) {
    const sql = this.sqlUtil.getById(tableName, id);
    const rows = await this.query(sql, id);
    return rows[0];
  }

  /**
   * Inserts a record into a given table.
   * The keys of obj are column names
   * and their values are the values to insert.
   */
  async insert(tableName, obj) {
    const sql = this.sqlUtil.insert(tableName, obj);

    const keys = Object.keys(obj);
    const values = keys.map(key => obj[key]);
    const result = await this.query(sql, ...values);

    return result.insertId;
  }

  /**
   * Executes a SQL query.
   * It is the most general purpose function provided.
   * This is used by several of the other functions.
   */
  // eslint-disable-next-line require-await
  query(sql, ...params) {
    if (!this.connection) return Promise.reject('Connection not available.');

    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Executes a given function inside a transaction.
   * This function can call other functions in this API
   * to perform database operations.
   * The function must return a promise to indicate
   * when it has completed (resolve)
   * or when an error has occurred (reject).
   * If the function throws an error or rejects,
   * the transaction is rolled back.
   * Otherwise it is committed.
   */
  transaction(fn) {
    if (!this.connection) return Promise.reject('Connection not available.');

    return new Promise((resolve, reject) => {
      this.connection.beginTransaction(async err => {
        if (err) {
          reject(err);
        }

        try {
          const result = await fn();
          this.connection.commit(err => {
            if (err) throw err;
            resolve(result);
          });
        } catch (e) {
          this.connection.rollback(() => reject(e));
        }
      });
    });
  }

  /**
   * Updates a record in a given table by id.
   * This requires the table to have a column named "id".
   */
  updateById(tableName, id, obj) {
    const sql = this.sqlUtil.updateById(tableName, id, obj);
    return this.query(sql, id);
  }

  /**
   * Inserts a record into a given table if it doesn't already exist.
   * Updates it if it does exist.
   * The keys of obj are column names
   * and their values are the values to insert.
   */
  async upsert(tableName, obj) {
    const sql = this.sqlUtil.upsert(tableName, obj);

    const keys = Object.keys(obj);
    const values = keys.map(key => obj[key]);
    const result = await this.query(sql, ...values, ...values);

    return result.insertId;
  }
}

module.exports = MySqlConnection;
