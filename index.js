const mysql = require('mysql');
const SqlUtil = require('./sql-util');

class MySqlConnection {

  /**
   * This configures a PostgreSQLconnection pool.
   * The object created can be used to interact with a given database.
   *
   * To use this,
   * const PgConnection = require('postgresql-easy');
   * const pg = new PgConnection(config);
   *
   * The config object can contain these properties:
   *   host: defaults to localhost
   *   user: if database requires authentication
   *   password: if database requires authentication
   *   database: the name of the database to use
   *   debug: true to output messages describing each action; defaults to false
   *   acquireTimeout: time before the connection is closed; default is 30000
   *   connectionLimit: maximum number of concurrent connections; default is 10
   *   queueLimit: maximum number of queuedconnection requests; default is 0
   *   waitForConnections: boolean that determines if connection requests
   *   should be queued if there are no available connections; default is true
   *
   * The only one of these that is always required is "database".
   */
  constructor(config) {
    this.pool = new mysql.createPool(config);
    this.sqlUtil = new SqlUtil(this.pool, config.debug);
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

  /**
   * Disconnects from the database.
   */
  disconnect() {
    this.sqlUtil.disconnect();
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
  getById(tableName, id) {
    const sql = this.sqlUtil.getById(tableName, id);
    return this.query(sql, id);
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
    await this.query(sql[0], ...values);

    const rows = await this.query(sql[1]);
    const id = rows[0]['last_insert_id()'];
    return id;
  }

  /**
   * Executes a SQL query.
   * It is the most general purpose function provided.
   * This is used by several of the other functions.
   */
  // eslint-disable-next-line require-await
  query(sql, ...params) {
    return new Promise((resolve, reject) => {
      if (this.pool) {
        this.pool.query(sql, params, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      } else {
        reject('pool not configured');
      }
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
}

module.exports = MySqlConnection;
