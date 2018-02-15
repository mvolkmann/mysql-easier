const mysql = require('mysql');
const MySqlConnection = require('./mysql-connection');

/**
 * MySqlPool
 * This class wraps a 'Pool' from mysqljs as described here:
 *  + https://github.com/mysqljs/mysql#pooling-connections
 *
 * The basic benefits it provides are:
 *  1 - Functions use Promises instead of callbacks
 *  2 - Connections that are created are instances of our own
 *      MySqlConnection - which provides convenience methods for common
 *      database operations.
 *
 * If you require additional control, you can access the mysqljs 'Pool'
 * by going directly to the `pool` property of this object.
 */
class MySqlPool {

  /**
   * Create a new MySqlPool with the provided configuration.
   *
   * Configuration options are the same as the ones that mysqljs accepts:
   *  + https://github.com/mysqljs/mysql#pool-options
   *
   * Generally speaking, you will get a MySql pool by calling either:
   *  + `mySqlEasier.configure(config)` -- to create a global pool for the app
   *  + `const myPool = mySqlEasier.createPool(config)` -- to create a new pool
   */
  constructor(config) {
    this.config = config;
    this.pool = new mysql.createPool(config);
  }

  /**
   * End this pool.  After the end operation is complete, connections
   * that were retrieved from this pool will no longer function.
   */
  end() {
    if (!this.pool) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.pool.end(err => {
        this.pool = null;
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Retrieve a MySqlConnection from this pool.
   *
   * When you are done with the connection, call `myConnection.done()`
   * to release it back to the pool.
   */
  getConnection() {
    return new Promise((resolve, reject) => {
      if (!this.pool) {
        reject('Pool has ended. Connections are not available.');
      } else {
        this.pool.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(new MySqlConnection(connection, this.config));
          }
        });
      }
    });
  }
}

module.exports = MySqlPool;
