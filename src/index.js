const mysql = require('mysql');
const MySqlConnection = require('./mysql-connection');
const MySqlPool = require('./mysql-pool');

/**
 * MySqlEasier
 * This is a global object that represents the common use cases.  It is
 * intended to be a singleton in a node application that allows various
 * modules to share a single MySQL connection pool.
 *
 * To use this,
 * const mySqlEasier = require('mysql-easier');
 * mySqlEasier.configure(config);
 *
 * The config object can contain these properties:
 *   acquireTimeout: time before the connection is closed; default is 30000
 *   connectionLimit: maximum number of concurrent connections; default is 10
 *   database: the name of the database to use
 *   debug: true to output messages describing each action; defaults to false
 *   host: defaults to localhost
 *   password: if database requires authentication
 *   port: port the database is listening on; defaults to 3306
 *   queueLimit: maximum number of queued connection requests; default is 0
 *   user: if database requires authentication
 *   waitForConnections: boolean that determines if connection requests
 *   should be queued if there are no available connections; default is true
 *
 * The only one of these that is always required is "database".  For a
 * complete list of configuration options, please see the mysqljs
 * documentation here:
 *
 * + https://github.com/mysqljs/mysql#pool-options
 *
 * When you are done with your database interactions, please call
 * `mySqlEasier.endPool()` to end the pool.
 */
class MySqlEasier {
  /**
   * Creates a new MySqlEasier with a `null` pool.
   */
  constructor() {
    this.globalPool = null;
  }

  /**
   * Creates a new MySqlPool using the provided configuration.
   */
  configure(config) {
    if (this.globalPool) throw new Error('Pool has already been configured.');
    this.globalPool = this.createPool(config);
  }

  /**
   * Creates a new MySqlConnection using a non-pooled connection with the
   * provided configuration.
   *
   * This method should only be used if you intentionally do not wish to
   * use pooled connections.
   *
   * When you are done with the connection, you should call
   * `myConnection.done()` or `myConnection.destroy()`
   */
  createConnection(config) {
    return new MySqlConnection(mysql.createConnection(config), config);
  }

  /**
   * Creates a new MySqlPool using the provided configuration.
   *
   * This method can be used as an alternative to `configure`.  It may be
   * useful if you would like to manage your connection pools yourself.  For
   * example, if you require multiple simultaneous pools to exist at the same
   * time.
   *
   * When you are done with the pool, you should call `myPool.end()`.
   */
  createPool(config) {
    return new MySqlPool(config);
  }

  /**
   * Ends the global pool if it was created using `configure`.
   *
   * Once the pool has ended, any outstanding connections will cease to
   * perform.  This should only be done when you are confident that the pool
   * is no longer necessary.
   *
   * After you end the global pool, you can create a new one by calling
   * `mySqlEasier.configure(config)` again.
   */
  endPool() {
    if (!this.globalPool) return Promise.reject('Pool not configured');
    const poolToEnd = this.globalPool;
    this.globalPool = null;
    return poolToEnd.end();
  }

  /**
   * Retrieves a MySqlConnection from the global pool.
   *
   * Once you are done with the connection, please call `myConnection.done()`
   * to release it back to the pool.
   */
  getConnection() {
    if (!this.globalPool) return Promise.reject('Pool not configured');
    return this.globalPool.getConnection();
  }
}

module.exports = new MySqlEasier();
